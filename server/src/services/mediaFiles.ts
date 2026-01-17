import { MediaFiles } from "@/models";
import { MediaFilesCreationAttributes, PublicMediaFilesAttributes, PresignedUrlType, MediaFilesAttributes, OwnerType } from "@/interfaces/mediaFiles";
import { S3Service } from "@/services/s3";
import { config } from "@/config/env";
import mediaFilesRepository from '@/repositories/mediaFiles';
import { generateS3ObjKey } from '@/utils/mediaFiles';
import { handleServiceError } from '@/utils/serviceErrorHandler';
import { AppError } from "@/middleware/error_middleware";
import { ErrorTypes } from "@/interfaces/error";

const s3Service = new S3Service();

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

        await s3Service.duplicateFile(
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

    @handleServiceError('Failed to delete file from S3')
    static async deleteFileFromS3(s3_key: string) {
        return await s3Service.deleteFile( s3_key, config.AWS_S3_BUCKET );
    }

    @handleServiceError('Failed to get media file')
    static async getMediaFile(public_id: string) {
        return await mediaFilesRepository.getMediaFile(public_id);
    }

    @handleServiceError('Failed to get public media file data')
    static async getPublicMediaFileData(
        mediaFile: MediaFiles,
        urlTypes: PresignedUrlType[] = [PresignedUrlType.GET, PresignedUrlType.PUT, PresignedUrlType.DELETE],
        timeToLive: number = 5 * 60 * 1000
    ): Promise<PublicMediaFilesAttributes> {
        const expiresAt = Date.now() + timeToLive;
        const mediaFileData = mediaFile.get();

        const result: PublicMediaFilesAttributes = {
            expiresAt,
            id: mediaFileData.public_id,
            owner_type: mediaFileData.owner_type,
            type: mediaFileData.type,
            file_name: mediaFileData.filename
        };

        // Generate URLs based on requested types
        const urlPromises = urlTypes.map(async (urlType) => {
            const url = await this.getMediaPresignedUrl(mediaFile, urlType, timeToLive);
            
            switch (urlType) {
                case PresignedUrlType.GET:
                    result.presigned_get_URL = url;
                    break;
                case PresignedUrlType.PUT:
                    result.presigned_put_URL = url;
                    break;
                case PresignedUrlType.DELETE:
                    result.presigned_delete_URL = url;
                    break;
            }
        });

        await Promise.all(urlPromises);
        return result;
    }

    @handleServiceError('Failed to get media presigned URL')
    private static async getMediaPresignedUrl(
        mediaFile: MediaFiles,
        urlType: PresignedUrlType,
        timeToLive: number
    ): Promise<string> {
        if(!mediaFile || !mediaFile.get().s3_key) {
            throw new AppError('Media file not found', 404, ErrorTypes.NOT_FOUND);
        }
        
        if(mediaFile.get().is_active === false) {
            throw new AppError(
                'Media file is inactive and cannot generate presigned URL',
                400,
                ErrorTypes.INVALID_OPERATION
            );
        }

        const s3Key = mediaFile.get().s3_key;
        const bucket = config.AWS_S3_BUCKET;

        let presignedUrl;

        switch (urlType) {
            case PresignedUrlType.GET:
                presignedUrl = await s3Service.generatePresignedGetUrl(s3Key, bucket, timeToLive);
                break;
            case PresignedUrlType.PUT:
                presignedUrl = await s3Service.generatePresignedPutUrl(s3Key, bucket, timeToLive);
                break;
            case PresignedUrlType.DELETE:
                presignedUrl = await s3Service.generatePresignedDeleteUrl(s3Key, bucket, timeToLive);
                break;
        }

        return presignedUrl.url;
    }
}
