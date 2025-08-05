import { DownloadsService } from "../services/downloads";
import { AuthRequest } from "../interfaces/auth";
import { Response, NextFunction } from "express";
import { PublicCVAttributes } from "../interfaces/cv";

export class DownloadsController {

    static async initDownload(req: AuthRequest, res: Response, next: NextFunction) {
        const user = req.user;
        const file = req.file;
        const documentData = req.body.documentData;

        const CVData = JSON.parse(documentData) as PublicCVAttributes;

        try {
            const downloadInitResponse = await DownloadsService.initDownload(user, CVData, file); 
            return res.status(200).json(downloadInitResponse)
        } catch (error) {
            return next(error);
        }
    }
}