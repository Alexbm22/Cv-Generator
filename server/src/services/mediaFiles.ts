import { MediaFiles } from "../models";
import { MediaTypes, OwnerTypes, PresignedUrl } from "../interfaces/mediaFiles";
import { AppError } from "../middleware/error_middleware";
import { ErrorTypes } from "../interfaces/error";
import { S3Service } from "./s3";
import { config } from "../config/env";

const s3Service = new S3Service();

export class MediaFilesServices {

    static async create(
        owner_id: number,
        owner_type: OwnerTypes,
        file_type: MediaTypes,
        obj_key: string
    ) {
        try {
            return await MediaFiles.create({
                owner_id,
                owner_type,
                obj_key,
                type: file_type,
            });
        } catch (error) {
            throw new AppError(
                "Failed to create media file",
                500,
                ErrorTypes.INTERNAL_ERR
            );
        }
    }

    static async getPresignedGetUrl(
        mediaFileId: string
    ): Promise<PresignedUrl> {
        const mediaFile = await MediaFiles.findOne({
            where: { public_id: mediaFileId }
        });

        if (!mediaFile) {
            throw new AppError(
                "Media file not found",
                404,
                ErrorTypes.NOT_FOUND
            );
        }

        const presignedUrl = await s3Service.generatePresignedGetUrl(mediaFile.obj_key, config.AWS_S3_BUCKET);

        return {
            url: presignedUrl.url,
            expiresAt: presignedUrl.expiresAt
        }
    }

    static async getPresignedPutUrl(
        mediaFileId: string
    ): Promise<PresignedUrl> {
        const mediaFile = await MediaFiles.findOne({
            where: { public_id: mediaFileId }
        });

        if (!mediaFile) {
            throw new AppError(
                "Media file not found",
                404,
                ErrorTypes.NOT_FOUND
            );
        }

        const presignedUrl = await s3Service.generatePresignedPutUrl(mediaFile.obj_key, config.AWS_S3_BUCKET);

        return {
            url: presignedUrl.url,
            expiresAt: presignedUrl.expiresAt
        }
    }
}
