import { MediaFiles } from "@/models";
import { MediaFilesCreationAttributes, PublicMediaFilesAttributes, PresignedUrlType, MediaFilesAttributes, OwnerType } from "@/interfaces/mediaFiles";
import S3Service from "@/services/s3";
import { config } from "@/config/env";
import mediaFilesRepository from '@/repositories/mediaFiles';
import { generateS3ObjKey } from '@/utils/mediaFiles';
import { handleServiceError } from '@/utils/serviceErrorHandler';
import { AppError } from "@/middleware/error_middleware";
import { ErrorTypes } from "@/interfaces/error";

export class MediaFilesServices {

    @handleServiceError('Failed to create media file')
    static async create(
        mediaFileObj: Omit<MediaFilesCreationAttributes, 's3_key'>
    ) {
        const s3ObjKey = generateS3ObjKey(
            mediaFileObj.owner_type, 
            mediaFileObj.owner_id, 
            mediaFileObj.type,
            mediaFileObj.filename,
            mediaFileObj.mime_type
        );

        const mediaFileData = { ...mediaFileObj, s3_key: s3ObjKey }
        return await mediaFilesRepository.createMediaFile(mediaFileData);
    }

    @handleServiceError('Failed to duplicate media file')
    static async duplicateMediaFile(
        newMediaFileData: Omit<MediaFilesCreationAttributes, 's3_key'>,
        duplicatedMediaFile: MediaFilesAttributes
    ) {
        const createdMediaFile = await this.create(newMediaFileData);

        await S3Service.duplicateFile(
            config.AWS_S3_BUCKET,
            duplicatedMediaFile.s3_key,
            createdMediaFile.get().s3_key
        )

        return createdMediaFile;
    }

    @handleServiceError('Failed to bulk create media files')
    static async bulkCreate(
        mediaFileObjects: Omit<MediaFilesCreationAttributes, 's3_key'>[]
    ) {
        const mediaFilesData = mediaFileObjects.map(async (mediaFile) => {
            const s3ObjKey = generateS3ObjKey(
                mediaFile.owner_type, 
                mediaFile.owner_id, 
                mediaFile.type,
                mediaFile.filename,
                mediaFile.mime_type
            );

            return { ...mediaFile, s3_key: s3ObjKey }
        })
        
        return await mediaFilesRepository.bulkCreateMediaFiles(await Promise.all(mediaFilesData));
    }

    @handleServiceError('Failed to delete owner media files')
    static async deleteOwnerMediaFiles(ownerId: number, owner_type: OwnerType) {
        return await mediaFilesRepository.deleteOwnerMediaFiles(ownerId, owner_type);
    }

    @handleServiceError('Failed to get media file')
    static async getMediaFile(public_id: string) {
        return await mediaFilesRepository.getMediaFile(public_id);
    }

    @handleServiceError('Failed to get public media file data')
    static async getPublicMediaFileData(
        mediaFilePublicId: string,
        timeToLive: number = 5 * 60 * 1000
    ): Promise<PublicMediaFilesAttributes> {
        const expiresAt = Date.now() + timeToLive;

        const mediaFile = await MediaFilesServices.getMediaFile(mediaFilePublicId);
        if(!mediaFile) {
            throw new AppError(
                'Media file not found',
                404,
                ErrorTypes.NOT_FOUND
            );
        }

        const mediaFileData = mediaFile.get();
        const get_URL = await this.getMediaPresignedUrl(mediaFile, PresignedUrlType.GET, timeToLive);

        const result: PublicMediaFilesAttributes = {
            expiresAt,
            is_active: mediaFileData.is_active,
            id: mediaFileData.public_id,
            owner_type: mediaFileData.owner_type,
            type: mediaFileData.type,
            file_name: mediaFileData.filename,  
            get_URL
        };

        return result;
    }

    @handleServiceError('Failed to upload file')
    static async uploadFile(
        mediaFileId: number,
        stream: NodeJS.ReadableStream,
        contentType?: string
    ): Promise<void> {
        const mediaFile = await mediaFilesRepository.getMediaFileById(mediaFileId);
        
        if (!mediaFile) {
            throw new AppError('Media file not found', 404, ErrorTypes.NOT_FOUND);
        }

        const mediaFileData = mediaFile.get();
        
        if (contentType && mediaFileData.mime_type !== contentType) {
            throw new AppError(
                `Content type mismatch: expected ${mediaFileData.mime_type}, received ${contentType}`,
                400,
                ErrorTypes.BAD_REQUEST
            );
        }

        await S3Service.uploadStreamToS3(
            stream as import('stream').Readable,
            mediaFileData.s3_key,
            config.AWS_S3_BUCKET,
            contentType || mediaFileData.mime_type
        );
    }

    @handleServiceError('Failed to get media presigned URL')
    private static async getMediaPresignedUrl(
        mediaFile: MediaFiles,
        urlType: PresignedUrlType,
        timeToLive: number
    ): Promise<string | null> {
        if(!mediaFile || !mediaFile.get().s3_key) {
            throw new AppError('Media file not found', 404, ErrorTypes.NOT_FOUND);
        }
        
        if(mediaFile.get().is_active === false && urlType == PresignedUrlType.GET) {
            return null;
        }

        const s3Key = mediaFile.get().s3_key;
        const bucket = config.AWS_S3_BUCKET;

        let presignedUrl;

        switch (urlType) {
            case PresignedUrlType.GET:
                presignedUrl = await S3Service.generatePresignedGetUrl(s3Key, bucket, timeToLive);
                break;
            case PresignedUrlType.PUT:
                presignedUrl = await S3Service.generatePresignedPutUrl(s3Key, bucket, timeToLive);
                break;
            case PresignedUrlType.DELETE:
                presignedUrl = await S3Service.generatePresignedDeleteUrl(s3Key, bucket, timeToLive);
                break;
        }

        return presignedUrl.url;
    }
    
    @handleServiceError('Failed to delete media file')
    public static async deleteMediaFileS3Content(mediaFilePublicId: string) {
        const mediaFile = await MediaFilesServices.getMediaFile(mediaFilePublicId);

        if(!mediaFile) {
            throw new AppError('Media file not found', 404, ErrorTypes.NOT_FOUND);
        }

        await mediaFilesRepository.updateMediaFile(mediaFile.get().id, { is_active: false });  

        await S3Service.deleteFile(mediaFile.get().s3_key, config.AWS_S3_BUCKET);
    }

    @handleServiceError('Failed to get media file PUT URL')
    static async getMediaFilePutUrl(
        mediaFilePublicId: string,
        timeToLive: number = 5 * 60 * 1000
    ) {
        const mediaFile = await MediaFilesServices.getMediaFile(mediaFilePublicId);
        if(!mediaFile) {
            throw new AppError(
                'Media file not found',
                404,
                ErrorTypes.NOT_FOUND
            );
        }

        const putUrl = await this.getMediaPresignedUrl(mediaFile, PresignedUrlType.PUT, timeToLive);
        return { url: putUrl };
    }

    @handleServiceError('Failed to update media file active status')
    static async setMediaFileActiveStatus(mediaFilePublicId: string, isActive: boolean) {
        const mediaFile = await MediaFilesServices.getMediaFile(mediaFilePublicId);
        if(!mediaFile) {
            throw new AppError(
                'Media file not found',
                404,
                ErrorTypes.NOT_FOUND
            );
        }

        const mediaFileData = mediaFile.get();
        await mediaFilesRepository.updateMediaFile(mediaFileData.id, { is_active: isActive });
    }
}
