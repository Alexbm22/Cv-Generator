import { MediaFiles } from "../models";
import { MediaFilesAttributes, MediaTypes, OwnerTypes, PublicMediaFilesAttributes } from "../interfaces/mediaFiles";
import { AppError } from "../middleware/error_middleware";
import { ErrorTypes } from "../interfaces/error";
import { S3Service } from "./s3";
import { config } from "../config/env";

const s3Service = new S3Service();

export class MediaFilesServices {

    static async create(
        mediaFileObj: Omit<MediaFilesAttributes, 'id' | 'createdAt' | 'updatedAt' | 'public_id'>
    ) {
        try {
            return await MediaFiles.create(mediaFileObj);
        } catch (error) {
            console.error(error)
            throw new AppError(
                "Failed to create media file",
                500,
                ErrorTypes.INTERNAL_ERR
            );
        }
    }

    static async bulkCreate(
        mediaFileObj: Omit<MediaFilesAttributes, 'id' | 'createdAt' | 'updatedAt' | 'public_id'>[]
    ) {
        try {
            return await MediaFiles.bulkCreate(mediaFileObj);
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
            return await MediaFiles.findOne({
                where: {
                    public_id,
                }
            });
        } catch (error) {
            throw new AppError(
                "Failed to get media file",
                500,
                ErrorTypes.INTERNAL_ERR
            );
        }
    }

    static async getPublicMediaFileData(
        mediaFile: MediaFiles
    ): Promise<PublicMediaFilesAttributes> {
        const timeToLive = 60 * 1000;

        const expiresAt = Date.now() + timeToLive;
        const getURL = await this.getMediaPresignedGetUrl(mediaFile, timeToLive);
        const putURL = await this.getMediaPresignedPutUrl(mediaFile, timeToLive);
        const deleteUrl = await this.getMediaPresignedDeleteUrl(mediaFile, timeToLive);

        const mediaFileData = mediaFile.get();

        return {
            expiresAt,
            id: mediaFileData.public_id,
            owner_type: mediaFileData.owner_type,
            type: mediaFileData.type,
            presigned_get_URL: getURL,
            presigned_put_URL: putURL,
            presigned_delete_URL: deleteUrl
        }
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
