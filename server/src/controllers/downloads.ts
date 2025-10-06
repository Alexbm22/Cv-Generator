import { DownloadsService } from "../services/downloads";
import { AuthRequest } from "../interfaces/auth";
import { Response, NextFunction } from "express";
import { PublicCVAttributes } from "../interfaces/cv";
import { AppError } from "../middleware/error_middleware";
import { ErrorTypes } from "../interfaces/error";

export class DownloadsController {

    static async validateDownload(req: AuthRequest, res: Response, next: NextFunction) {
        const user = req.user;
        const documentData = req.body.documentData;
        
        try {
            const CVData = JSON.parse(documentData) as PublicCVAttributes;
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
            const userDownloads = await DownloadsService.getUserDownloadsPublicData(user); 
            return res.status(200).json(userDownloads)
        } catch (error) {
            return next(error);
        }
    }
}