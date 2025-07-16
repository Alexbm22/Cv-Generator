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
            const createCVsResult = await CVsService.createCVs(userData.id, cvs);
            return res.status(200).json(createCVsResult);
        } catch (error) {
            return next(error);
        }
    }

    static async create(req: AuthRequest, res: Response, next: NextFunction) {
        const user = req.user;
        const userData = user.get();

        try {
            const createCVResult = await CVsService.createDefaultCV(userData.id);
            return res.status(200).json(createCVResult)
        } catch (error) {
            return next(error);
        }
    }

    static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
        const user = req.user;
        const userData = user.get();

        try {
            const CVs = await CVsService.getAllCVs(userData.id);
            return res.status(200).json(CVs)
        } catch (error) {
            return next(error);
        }
    }

    static async sync(req: AuthRequest, res: Response, next: NextFunction) {
        const clientCVs: PublicCVAttributes[] = req.body;
        const user = req.user;
        const userData = user.get();

         if (!Array.isArray(clientCVs)) {
            return next(new AppError('Invalid CV data format.', 400, ErrorTypes.BAD_REQUEST));
        }

        try {
            const syncingResult = await CVsService.syncCVs(userData.id, clientCVs);
            return res.status(200).json(syncingResult);
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