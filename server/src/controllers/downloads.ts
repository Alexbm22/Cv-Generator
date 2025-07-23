import { DownloadsService } from "../services/downloads";
import { AuthRequest } from "../interfaces/auth";
import { Response, NextFunction } from "express";
import { PublicCVAttributes } from "../interfaces/cv";

export class DownloadsController {

    static async initDownload(req: AuthRequest, res: Response, next: NextFunction) {
        const user = req.user;
        const CV: PublicCVAttributes = req.body;

        try {
            const downloadInitResponse = await DownloadsService.initDownload(user, CV); 
            return res.status(200).json(downloadInitResponse)
        } catch (error) {
            return next(error);
        }
    }
}