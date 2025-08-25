import { MediaFiles } from "../models";
import { MediaFilesAttributes, MediaTypes, OwnerTypes, PresignedUrl, PublicMediaFilesAttributes } from "../interfaces/mediaFiles";
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

    static async getPublicMediaFileData(
        mediaFile: MediaFiles
    ): Promise<PublicMediaFilesAttributes> {
        const getURL = await this.getMediaPresignedGetUrl(mediaFile);
        const putURL = await this.getMediaPresignedPutUrl(mediaFile);

        const mediaFileData = mediaFile.get();

        return {
            id: mediaFileData.public_id,
            owner_type: mediaFileData.owner_type,
            type: mediaFileData.type,
            presigned_get_URL: getURL,
            presigned_put_URL: putURL,
        }
    }

    static async getMediaPresignedGetUrl(
        mediaFile: MediaFiles
    ): Promise<PresignedUrl> {

        const presignedUrl = await s3Service.generatePresignedGetUrl(mediaFile.get().obj_key, config.AWS_S3_BUCKET);

        return {
            url: presignedUrl.url,
            expiresAt: presignedUrl.expiresAt
        }
    }

    static async getMediaPresignedPutUrl(
        mediaFile: MediaFiles
    ): Promise<PresignedUrl> {

        const presignedUrl = await s3Service.generatePresignedPutUrl(mediaFile.get().obj_key, config.AWS_S3_BUCKET);

        return {
            url: presignedUrl.url,
            expiresAt: presignedUrl.expiresAt
        }
    }
}
