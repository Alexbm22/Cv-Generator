import { Request, Response, NextFunction } from 'express';
import { CVsService } from "../services/cv_service";
import { ClientCVAttributes, CVAttributes } from '../interfaces/cv_interface';
import { AuthRequest } from '../interfaces/auth_interfaces';
import { AppError } from '../middleware/error_middleware';
import { ErrorTypes } from '@/interfaces/error_interface';


export class CVsController {
    private CVsService: CVsService;

    constructor() {
        this.CVsService = new CVsService();
    }

    async createCVs(req: AuthRequest, res: Response, next: NextFunction) {
        const user = req.user;
        const CVs: ClientCVAttributes[] = req.body;

        const createCVsResult = await this.CVsService.createCVs(user.id, CVs, next);

        return res.status(200).json(createCVsResult);
    }

    async createNewCV(req: AuthRequest, res: Response, next: NextFunction) {
        const user = req.user;

        const createCVResult = await this.CVsService.createDefaultCV(user.id);

        return res.status(200).json(createCVResult)
    }

    async getCVs(req: AuthRequest, res: Response, next: NextFunction) {
        const user = req.user;

        const CVs = await this.CVsService.getAllCVs(user.id, next);

        return res.status(200).json(CVs)
    }

    async syncCVs(req: AuthRequest, res: Response, next: NextFunction) {
        const clientCVs: ClientCVAttributes[] = req.body;
        const user = req.user;

        const syncingResult = await this.CVsService.syncCVs(user.id, clientCVs, next);

        return res.status(200).json(syncingResult);
    }

    async deleteCV(req: AuthRequest, res: Response, next: NextFunction) {
        const cvId = req.body;
        const user = req.user;

        const deleteResult = await this.CVsService.deleteCV(user, cvId, next);

        return res.status(200).json(deleteResult);
    }
}