import { Response, NextFunction } from 'express';
import { CVsService } from "../services/cv";
import { ClientCVAttributes } from '../interfaces/cv_interface';
import { AuthRequest } from '../interfaces/auth_interfaces';
import { AppError } from '../middleware/error_middleware';
import { ErrorTypes } from '../interfaces/error_interface';


export class CVsController {

    static async import(req: AuthRequest, res: Response, next: NextFunction) {
        const user = req.user;
        const cvs: ClientCVAttributes[] = req.body;

        if (!Array.isArray(cvs)) {
            return next(new AppError('Invalid CV data format.', 400, ErrorTypes.BAD_REQUEST));
        }

        try {
            const createCVsResult = await CVsService.createCVs(user.id, cvs);
            return res.status(200).json(createCVsResult);
        } catch (error) {
            return next(error);
        }
    }

    static async create(req: AuthRequest, res: Response, next: NextFunction) {
        const user = req.user;

        try {
            const createCVResult = await CVsService.createDefaultCV(user.id);
            return res.status(200).json(createCVResult)
        } catch (error) {
            return next(error);
        }
    }

    static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
        const user = req.user;
        try {
            const CVs = await CVsService.getAllCVs(user.id);
            return res.status(200).json(CVs)
        } catch (error) {
            return next(error);
        }
    }

    static async sync(req: AuthRequest, res: Response, next: NextFunction) {
        const clientCVs: ClientCVAttributes[] = req.body;
        const user = req.user;

         if (!Array.isArray(clientCVs)) {
            return next(new AppError('Invalid CV data format.', 400, ErrorTypes.BAD_REQUEST));
        }

        try {
            const syncingResult = await CVsService.syncCVs(user.id, clientCVs);
            return res.status(200).json(syncingResult);
        } catch (error) {
            return next(error);
        }
    }

    static async delete(req: AuthRequest, res: Response, next: NextFunction) {
        const cvId = req.params.id;
        const user = req.user;

        if(!cvId) {
            return next(new AppError("CV id is required!", 400, ErrorTypes.BAD_REQUEST))
        }

        try {
            const deleteResult = await CVsService.deleteCV(user, cvId);
            return res.status(200).json(deleteResult);
        } catch (error) {
            return next(error);
        }
    }
}