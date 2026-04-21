import { MediaFilesServices } from "../services/mediaFiles";
import { AuthRequest } from "../interfaces/auth";
import { Response, NextFunction } from "express";

export class MediaFilesController {

    static async getMediaFile(req: AuthRequest, res: Response, next: NextFunction) {
        const mediaFilePublicId = req.params.id;

        try {
            const PublicMediaFileData = await MediaFilesServices.getPublicMediaFileDataById(mediaFilePublicId);
            res.status(200).json(PublicMediaFileData);
        } catch (error) {
            return next(error)
        }
    }

    static async deleteMediaFile(req: AuthRequest, res: Response, next: NextFunction) {
        const mediaFilePublicId = req.params.id;

        try{
            await MediaFilesServices.deleteMediaFileS3Content(mediaFilePublicId);
            res.status(204).send();
        }
        catch(error) {
            return next(error);
        }
    }

    static async getMediaFilePutUrl(req: AuthRequest, res: Response, next: NextFunction) {
        const mediaFilePublicId = req.params.id;

        try {
            const putUrl = await MediaFilesServices.getMediaFilePutUrl(mediaFilePublicId);
            res.status(200).json(putUrl);
        } catch (error) {
            return next(error);
        }
    }

    static async getMediaFileGetUrl(req: AuthRequest, res: Response, next: NextFunction) {
        const mediaFilePublicId = req.params.id;

        try {
            const getUrl = await MediaFilesServices.getMediaFileGetUrl(mediaFilePublicId);
            res.status(200).json(getUrl);
        } catch (error) {
            return next(error);
        }
    }

    static async markMediaFileActiveStatus(req: AuthRequest, res: Response, next: NextFunction) {
        const mediaFilePublicId = req.params.id;
        const { is_active } = req.body;

        try {
            await MediaFilesServices.setMediaFileActiveStatus(
                mediaFilePublicId,
                is_active
            );
            res.status(200).send();
        } catch (error) {
            return next(error);
        }
    }
} 