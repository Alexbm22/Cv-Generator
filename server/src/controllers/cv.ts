import { Response, NextFunction } from 'express';
import { CVsService } from "../services/cv";
import { PublicCVAttributes } from '../interfaces/cv';
import { AuthRequest } from '../interfaces/auth';
import { AppError } from '../middleware/error_middleware';
import { ErrorTypes } from '../interfaces/error';
import { MediaFilesServices } from '../services/mediaFiles';

export class CVsController {

    static async import(req: AuthRequest, res: Response, next: NextFunction) {
        const authenticatedUser = req.user;
        const userInfo = authenticatedUser.get();

        const cvsToImport: PublicCVAttributes[] = req.body;

        try {
            if (!Array.isArray(cvsToImport)) {
                throw new AppError('Invalid CV data format.', 400, ErrorTypes.BAD_REQUEST);
            }

            const importedCVs = await CVsService.createCVs(userInfo.id, cvsToImport);
            const importedCVsMetaData = importedCVs.map(
                (cv) => CVsService.getCVMetaData(
                    cv.CVData.get(), 
                    cv.CVPreview, 
                    cv.CVPhoto
                )
            );

            return res.status(200).json(importedCVsMetaData);
        } catch (error) {
            return next(error);
        }
    }

    static async create(req: AuthRequest, res: Response, next: NextFunction) {
        const authenticatedUser = req.user;
        const userInfo = authenticatedUser.get();

        try {
            const { createdCV, createdCVPhoto, createdCVPreview } = await CVsService.createCV(userInfo.id);

            const publicPhotoData = await MediaFilesServices.getPublicMediaFileData(createdCVPhoto);
            const publicPreviewData = await MediaFilesServices.getPublicMediaFileData(createdCVPreview);
            
            const publicCVData = CVsService.mapServerCVToPublicCV(createdCV.get(), publicPhotoData, publicPreviewData);
            
            return res.status(200).json(publicCVData);
        } catch (error) {
            return next(error);
        }
    }

    static async getCVsMetaData(req: AuthRequest, res: Response, next: NextFunction) {
        const authenticatedUser = req.user;
        const userInfo = authenticatedUser.get();

        try {
            const userCVs = await CVsService.getUserCVs(userInfo.id);
            const userCVsMetaData = Promise.all(userCVs.map((cv) => CVsService.getCVMetaData(cv.CVData.get(), cv.CVPreview, cv.CVPhoto)));

            return res.status(200).json(await userCVsMetaData);
        } catch (error) {
            return next(error);
        }
    }

    static async getCV(req: AuthRequest, res: Response, next: NextFunction) {
        const authenticatedUser = req.user;
        const userInfo = authenticatedUser.get();
        
        const cvPublicId: string = req.params.id;

        try {
            if (!cvPublicId) {
                throw new AppError(
                    "CV public id is required!", 
                    400, 
                    ErrorTypes.BAD_REQUEST
                );
            }

            const { CVData, CVPhoto, CVPreview } = await CVsService.getCV(userInfo.id, cvPublicId);

            const publicPhotoData = await MediaFilesServices.getPublicMediaFileData(CVPhoto);
            const publicPreviewData = await MediaFilesServices.getPublicMediaFileData(CVPreview);
            
            const publicCVData = CVsService.mapServerCVToPublicCV(CVData.get(), publicPhotoData, publicPreviewData);

            return res.status(200).json(publicCVData);
        } catch (error) {
            return next(error);
        }
    }

    static async sync(req: AuthRequest, res: Response, next: NextFunction) {
        const authenticatedUser = req.user;
        const userInfo = authenticatedUser.get();
        
        const cvUpdates: PublicCVAttributes = req.body;
        const cvPublicId: string = req.params.id;

        try {
            if (!cvUpdates || !cvPublicId) {
                throw new AppError(
                    'Invalid CV data.', 
                    400, 
                    ErrorTypes.BAD_REQUEST
                );
            }
            
            await CVsService.syncCV(userInfo.id, cvUpdates);
            return res.status(204).end();
        } catch (error) {
            return next(error);
        }
    }

    static async delete(req: AuthRequest, res: Response, next: NextFunction) {
        const authenticatedUser = req.user;
        const userInfo = authenticatedUser.get();

        const cvPublicId = req.params.id;
        
        try {
            if (!cvPublicId) {
                throw new AppError(
                    "CV id is required!", 
                    400, 
                    ErrorTypes.BAD_REQUEST
                );
            }

            const deleteResult = await CVsService.deleteCV(userInfo, cvPublicId);
            return res.status(200).json(deleteResult);
        } catch (error) {
            return next(error);
        }
    }
}
