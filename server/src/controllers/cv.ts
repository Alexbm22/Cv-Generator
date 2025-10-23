import { Response, NextFunction } from 'express';
import { CVsService } from "../services/cv";
import { PublicCVAttributes } from '../interfaces/cv';
import { AuthRequest } from '../interfaces/auth';
import { AppError } from '../middleware/error_middleware';
import { ErrorTypes } from '../interfaces/error';

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

            return res.status(200).json(importedCVs);
        } catch (error) {
            return next(error);
        }
    }

    static async createDefaultCV(req: AuthRequest, res: Response, next: NextFunction) {
        const authenticatedUser = req.user;
        const userInfo = authenticatedUser.get();

        try {
            const publicCVData = await CVsService.createDefaultCV(userInfo.id);

            return res.status(200).json(publicCVData);
        } catch (error) {
            return next(error);
        }
    }

    static async getCVsMetaData(req: AuthRequest, res: Response, next: NextFunction) {
        const authenticatedUser = req.user;
        const userInfo = authenticatedUser.get();

        try {
            const userCVsMetadata = await CVsService.getAllCVsMetadata(userInfo.id);
            
            return res.status(200).json(userCVsMetadata);
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

            const publicCVData = await CVsService.getDetailedCV(userInfo.id, cvPublicId);

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
