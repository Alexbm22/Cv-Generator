import { Response, NextFunction } from 'express';
import { CVsService } from "../services/cv_service";
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

        const createCVsResult = await CVsService.createCVs(user.id, cvs, next);

        return res.status(200).json(createCVsResult);
    }

    static async create(req: AuthRequest, res: Response, next: NextFunction) {
        const user = req.user;

        const createCVResult = await CVsService.createDefaultCV(user.id);

        return res.status(200).json(createCVResult)
    }

    static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
        const user = req.user;

        const CVs = await CVsService.getAllCVs(user.id, next);

        return res.status(200).json(CVs)
    }

    static async sync(req: AuthRequest, res: Response, next: NextFunction) {
        const clientCVs: ClientCVAttributes[] = req.body;
        const user = req.user;

         if (!Array.isArray(clientCVs)) {
            return next(new AppError('Invalid CV data format.', 400, ErrorTypes.BAD_REQUEST));
        }

        const syncingResult = await CVsService.syncCVs(user.id, clientCVs, next);

        return res.status(200).json(syncingResult);
    }

    static async delete(req: AuthRequest, res: Response, next: NextFunction) {
        const cvId = req.params.id;
        const user = req.user;

        if(!cvId) {
            return next(new AppError("CV id is required!", 400, ErrorTypes.BAD_REQUEST))
        }

        const deleteResult = await CVsService.deleteCV(user, cvId, next);

        return res.status(200).json(deleteResult);
    }
}