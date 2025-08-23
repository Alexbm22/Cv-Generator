import { Response, NextFunction } from 'express';
import { CVsService } from "../services/cv";
import { PublicCVAttributes } from '../interfaces/cv';
import { AuthRequest } from '../interfaces/auth';
import { AppError } from '../middleware/error_middleware';
import { ErrorTypes } from '../interfaces/error';


export class CVsController {

    static async import(req: AuthRequest, res: Response, next: NextFunction) {
        const user = req.user;
        const userData = user.get();
        const cvs: PublicCVAttributes[] = req.body;

        if (!Array.isArray(cvs)) {
            return next(new AppError('Invalid CV data format.', 400, ErrorTypes.BAD_REQUEST));
        }

        try {
            const createdCVs = await CVsService.createCVs(userData.id, cvs);
            const CVsMetaData = createdCVs.map((CV) => CVsService.getCVMetaData(CV.get()))

            return res.status(200).json(CVsMetaData);
        } catch (error) {
            return next(error);
        }
    }

    static async create(req: AuthRequest, res: Response, next: NextFunction) {
        const user = req.user;
        const userData = user.get();

        try {
            const createdCV = await CVsService.createCV(userData.id);
            const createdCVMetaData = CVsService.getCVMetaData(createdCV.get());
            
            return res.status(200).json(createdCVMetaData)
        } catch (error) {
            return next(error);
        }
    }

    static async getCVsMetaData(req: AuthRequest, res: Response, next: NextFunction) {
        const user = req.user;
        const userData = user.get();

        try {
            const CVs = await CVsService.getUserCVs(userData.id);
            const CVsMetaData = CVs.map((cv) => CVsService.getCVMetaData(cv.get()));

            return res.status(200).json(CVsMetaData)
        } catch (error) {
            return next(error);
        }
    }

    static async getCV(req: AuthRequest, res: Response, next: NextFunction) {
        const user = req.user;
        const userData = user.get();
        
        const cvPublicId: string = req.params.id;

        try {
            if (!cvPublicId) {
                throw new AppError(
                    "CV public id is required!", 
                    400, 
                    ErrorTypes.BAD_REQUEST
                );
            }

            const CV = await CVsService.getUserCV(userData.id, cvPublicId);
            const cvData = CV.get();
            const PublicCVData = CVsService.mapServerCVToPublicCV(cvData);

            return res.status(200).json(PublicCVData)
        } catch (error) {
            return next(error);
        }
    }

    static async sync(req: AuthRequest, res: Response, next: NextFunction) {
        const user = req.user;
        const userData = user.get();
        
        const CVUpdates: Partial<PublicCVAttributes> = req.body;
        const cvPublicId: string = req.params.id;

        try {
            if (!CVUpdates || !cvPublicId) {
                throw new AppError(
                    'Invalid CV data.', 
                    400, 
                    ErrorTypes.BAD_REQUEST
                );
            }
            
            const syncRes = await CVsService.syncCV(userData.id, CVUpdates, cvPublicId);
            return res.status(204).end()
        } catch (error) {
            return next(error);
        }
    }

    static async delete(req: AuthRequest, res: Response, next: NextFunction) {
        const cvId = req.params.id;
        const user = req.user;
        const userData = user.get();

        if(!cvId) {
            return next(new AppError("CV id is required!", 400, ErrorTypes.BAD_REQUEST))
        }

        try {
            const deleteResult = await CVsService.deleteCV(userData, cvId);
            return res.status(200).json(deleteResult);
        } catch (error) {
            return next(error);
        }
    }
}