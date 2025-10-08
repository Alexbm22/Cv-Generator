import { MediaFiles } from "@/models";
import { MediaFilesCreationAttributes, PublicMediaFilesAttributes, PresignedUrlType } from "@/interfaces/mediaFiles";
import { AppError } from "@/middleware/error_middleware";
import { ErrorTypes } from "@/interfaces/error";
import { S3Service } from "@/services/s3";
import { config } from "@/config/env";
import mediaFilesRepository from '@/repositories/mediaFiles';
import { generateS3ObjKey } from '@/utils/mediaFiles'

const s3Service = new S3Service();

export class MediaFilesServices {

    static async create(
        mediaFileObj: Omit<MediaFilesCreationAttributes, 'obj_key'>
    ) {
        try {
            const s3ObjKey = generateS3ObjKey(mediaFileObj);

            const mediaFileData = {
                ...mediaFileObj,
                obj_key: s3ObjKey
            }

            return await mediaFilesRepository.createMediaFile(mediaFileData);
        } catch (error) {
            throw new AppError(
                "Failed to create media file",
                500,
                ErrorTypes.INTERNAL_ERR
            );
        }
    }

    static async bulkCreate(
        mediaFileObjects: Omit<MediaFilesCreationAttributes, 'obj_key'>[]
    ) {
        try {
            const mediaFilesData = mediaFileObjects.map((mediaFile) => {
                const s3ObjKey = generateS3ObjKey(mediaFile);

                const mediaFileData = {
                    ...mediaFile,
                    obj_key: s3ObjKey
                }

                return mediaFileData;
            })
            
            return await mediaFilesRepository.bulkCreateMediaFiles(mediaFilesData);
        } catch (error) {
            throw new AppError(
                "Failed to create media file",
                500,
                ErrorTypes.INTERNAL_ERR
            );
        }
    }

    static async getMediaFile(public_id: string) {
        try {
            return await mediaFilesRepository.getMediaFile(public_id);
        } catch (error) {
            throw new AppError(
                "Failed to get media file",
                500,
                ErrorTypes.INTERNAL_ERR
            );
        }
    }

    

    // Alternative enum-based approach
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
