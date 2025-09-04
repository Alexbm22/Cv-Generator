import { MediaFilesServices } from "../services/mediaFiles";
import { AuthRequest } from "../interfaces/auth";
import { Response, NextFunction } from "express";
import { AppError } from "../middleware/error_middleware";
import { ErrorTypes } from "../interfaces/error";

export class MediaFilesController {

    static async getMediaFile(req: AuthRequest, res: Response, next: NextFunction) {
        const mediaFilePublicId = req.params.id;

        try {
            const mediaFile = await MediaFilesServices.getMediaFile(mediaFilePublicId);
            if(!mediaFile) {
                throw new AppError(
                    'Media file not found',
                    404,
                    ErrorTypes.NOT_FOUND
                );
            }

            const PublicMediaFileData = await MediaFilesServices.getPublicMediaFileData(mediaFile);

            res.status(200).json(PublicMediaFileData);

        } catch (error) {
            return next(error)
        }
    }
} 