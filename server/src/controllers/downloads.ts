import { DownloadsService } from "../services/downloads";
import { AuthRequest } from "../interfaces/auth";
import { Response, NextFunction } from "express";
import { PublicCVAttributes } from "../interfaces/cv";
import { AppError } from "../middleware/error_middleware";
import { ErrorTypes } from "../interfaces/error";
import { DownloadWorkflowService } from "../services/downloadWorkflow";

export class DownloadsController {

    static async prepareDownload(req: AuthRequest, res: Response, next: NextFunction) {
        const cvId = req.body?.cvId as string | undefined;
        if (!cvId) {
            return next(new AppError('cvId is required.', 400, ErrorTypes.BAD_REQUEST));
        }

        try {
            return res.status(200).json(await DownloadWorkflowService.prepare(req.user, cvId));
        } catch (error) {
            return next(error);
        }
    }

    static async completeDownload(req: AuthRequest, res: Response, next: NextFunction) {
        const actionId = req.body?.actionId as string | undefined;
        if (!actionId) {
            return next(new AppError('actionId is required.', 400, ErrorTypes.BAD_REQUEST));
        }

        try {
            return res.status(200).json(await DownloadWorkflowService.complete(req.user, req.params.id, actionId));
        } catch (error) {
            return next(error);
        }
    }

    static async failDownload(req: AuthRequest, res: Response, next: NextFunction) {
        const actionId = req.body?.actionId as string | undefined;
        const failureType = req.body?.failureType as string | undefined;
        const message = req.body?.message as string | undefined;
        if (!actionId || !failureType) {
            return next(new AppError('actionId and failureType are required.', 400, ErrorTypes.BAD_REQUEST));
        }

        try {
            await DownloadWorkflowService.fail(req.user, req.params.id, actionId, failureType, message);
            return res.status(204).send();
        } catch (error) {
            return next(error);
        }
    }

    static async validateDownload(req: AuthRequest, res: Response, next: NextFunction) {
        const user = req.user;
        const CVData = req.body;
        
        try {
            const validationResult = await DownloadsService.validateDownload(user, CVData);
            return res.status(200).json(validationResult);
        } catch (error) {
            return next(error);
        }
    }

    static async executeDownload(req: AuthRequest, res: Response, next: NextFunction) {
        const user = req.user;
        const file = req.file;
        const {
            documentData, validationToken
        } = req.body;

        if(!file || !documentData || !validationToken) {
            return next(new AppError(
                "Missing required fields for download.",
                400,
                ErrorTypes.BAD_REQUEST
            ));
        }
        
        const CVData = JSON.parse(documentData) as PublicCVAttributes;

        try {
            const downloadPublicData = await DownloadsService.executeDownload(user, CVData, validationToken as string, file); 
            return res.status(201).json(downloadPublicData);
        } catch (error) {
            return next(error);
        }
    }

    static async getDownloads(req: AuthRequest, res: Response, next: NextFunction) {
        const user = req.user;

        try {
            const userDownloads = await DownloadWorkflowService.getCompletedDownloads(user); 
            return res.status(200).json(userDownloads)
        } catch (error) {
            return next(error);
        }
    }

    static async duplicateDownload(req: AuthRequest, res: Response, next: NextFunction) {
        const user = req.user;
        const downloadId: string = req.params.id;

        try {
            if (!downloadId) {
                throw new AppError(
                    "Download id is required!", 
                    400, 
                    ErrorTypes.BAD_REQUEST
                );
            }
            
            const duplicatedCV = await DownloadWorkflowService.duplicateCompletedVersion(user, downloadId);
            return res.status(200).json(duplicatedCV);
        } catch (error) {
            return next(error);
        }
    }

    static async deleteDownload(req: AuthRequest, res: Response, next: NextFunction) {
        const authenticatedUser = req.user;

        const downloadId = req.params.id;
        
        try {
            if (!downloadId) {
                throw new AppError(
                    "Download id is required!", 
                    400, 
                    ErrorTypes.BAD_REQUEST
                );
            }

            await DownloadWorkflowService.deleteCompletedDownload(authenticatedUser, downloadId);
            return res.status(204).send();
        } catch (error) {
            return next(error);
        }
    }

    static async checkDownloadRights(req: AuthRequest, res: Response, next: NextFunction) {
        const user = req.user;

        try {
            const hasDownloadRights = await DownloadsService.checkDownloadRights(user);
            return res.status(200).json(hasDownloadRights);
        } catch (error) {
            return next(error);
        }
    }

    static async checkDuplicateDownload(req: AuthRequest, res: Response, next: NextFunction) {
        const user = req.user;
        const CVId = req.query.CVId as string;

        if (!CVId) {
            return next(new AppError(
                "CVId query parameter is required.",
                400,
                ErrorTypes.BAD_REQUEST
            ));
        }
        
        try {
            const isDuplicate = await DownloadsService.checkDuplicateDownload(user, CVId);
            return res.status(200).json(isDuplicate);
        } catch (error) {
            return next(error);
        }
    }

}