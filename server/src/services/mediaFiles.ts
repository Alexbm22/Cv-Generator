import { MediaFiles } from "@/models";
import { MediaFilesCreationAttributes, PublicMediaFilesAttributes, PresignedUrlType, MediaFilesAttributes, OwnerType } from "@/interfaces/mediaFiles";
import { AppError } from "@/middleware/error_middleware";
import { ErrorTypes } from "@/interfaces/error";
import { S3Service } from "@/services/s3";
import { config } from "@/config/env";
import mediaFilesRepository from '@/repositories/mediaFiles';
import { generateS3ObjKey } from '@/utils/mediaFiles';
import { handleServiceError } from '@/utils/serviceErrorHandler';

const s3Service = new S3Service();

export class MediaFilesServices {

    @handleServiceError('Failed to create media file')
    static async create(
        mediaFileObj: Omit<MediaFilesCreationAttributes, 'obj_key'>
    ) {
        const s3ObjKey = generateS3ObjKey(mediaFileObj);

        const mediaFileData = {
            ...mediaFileObj,
            obj_key: s3ObjKey
        }

        return await mediaFilesRepository.createMediaFile(mediaFileData);
    }

    @handleServiceError('Failed to duplicate media file')
    static async duplicateMediaFile(
        newMediaFileData: Omit<MediaFilesCreationAttributes, 'obj_key'>,
        duplicatedMediaFile: MediaFilesAttributes
    ) {
        const createdMediaFile = await this.create(newMediaFileData);

        s3Service.duplicateFile(
            config.AWS_S3_BUCKET,
            duplicatedMediaFile.obj_key,
            createdMediaFile.get().obj_key
        )

        return createdMediaFile;
    }

    @handleServiceError('Failed to bulk create media files')
    static async bulkCreate(
        mediaFileObjects: Omit<MediaFilesCreationAttributes, 'obj_key'>[]
    ) {
        const mediaFilesData = mediaFileObjects.map((mediaFile) => {
            const s3ObjKey = generateS3ObjKey(mediaFile);

            const mediaFileData = {
                ...mediaFile,
                obj_key: s3ObjKey
            }

            return mediaFileData;
        })
        
        return await mediaFilesRepository.bulkCreateMediaFiles(mediaFilesData);
    }

    @handleServiceError('Failed to delete owner media files')
    static async deleteOwnerMediaFiles(ownerId: number, owner_type: OwnerType) {
        return await mediaFilesRepository.deleteOwnerMediaFiles(ownerId, owner_type);
    }

    @handleServiceError('Failed to delete file from S3')
    static async deleteFileFromS3(obj_key: string) {
        return await s3Service.deleteFile(
            obj_key,
            config.AWS_S3_BUCKET
        );
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
            file_name: mediaFileData.file_name
        };

        // Generate URLs based on requested types
        const urlPromises = urlTypes.map(async (urlType) => {
            switch (urlType) {
                case PresignedUrlType.GET:
                    result.presigned_get_URL = await this.getMediaPresignedGetUrl(mediaFile, timeToLive);
                    break;
                case PresignedUrlType.PUT:
                    result.presigned_put_URL = await this.getMediaPresignedPutUrl(mediaFile, timeToLive);
                    break;
                case PresignedUrlType.DELETE:
                    result.presigned_delete_URL = await this.getMediaPresignedDeleteUrl(mediaFile, timeToLive);
                    break;
            }
        });

        await Promise.all(urlPromises);
        return result;
    }

    @handleServiceError('Failed to get media presigned GET URL')
    static async getMediaPresignedGetUrl(
        mediaFile: MediaFiles, 
        timeToLive: number
    ): Promise<string> {

        const presignedUrl = await s3Service.generatePresignedGetUrl(
            mediaFile.get().obj_key, 
            config.AWS_S3_BUCKET, 
            timeToLive
        );

        return presignedUrl.url;
    }

    @handleServiceError('Failed to get media presigned PUT URL')
    static async getMediaPresignedPutUrl(
        mediaFile: MediaFiles,
        timeToLive: number
    ): Promise<string> {

        const presignedUrl = await s3Service.generatePresignedPutUrl(
            mediaFile.get().obj_key, 
            config.AWS_S3_BUCKET,
            timeToLive
        );

        return presignedUrl.url;
    }

    @handleServiceError('Failed to get media presigned DELETE URL')
    static async getMediaPresignedDeleteUrl(
        mediaFile: MediaFiles,
        timeToLive: number
    ): Promise<string> {

        const presignedUrl = await s3Service.generatePresignedDeleteUrl(
            mediaFile.get().obj_key, 
            config.AWS_S3_BUCKET,
            timeToLive
        );

        return presignedUrl.url;
    }
}
