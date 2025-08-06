import { DownloadsService } from "../services/downloads";
import { AuthRequest } from "../interfaces/auth";
import { Response, NextFunction } from "express";
import { PublicCVAttributes } from "../interfaces/cv";
import { AppError } from "../middleware/error_middleware";
import { ErrorTypes } from "../interfaces/error";

export class DownloadsController {

    static async createDownload(req: AuthRequest, res: Response, next: NextFunction) {
        const user = req.user;
        const file = req.file;
        const documentData = req.body.documentData;

        if(!file) {
            return next(new AppError(
                "No file provided for download.",
                400,
                ErrorTypes.BAD_REQUEST
            ))
        }
        
        const CVData = JSON.parse(documentData) as PublicCVAttributes;

        try {
            await DownloadsService.initDownload(user, CVData, file); 
            return res.status(204)
        } catch (error) {
            return next(error);
        }
    }

    static async getDownloads(req: AuthRequest, res: Response, next: NextFunction) {
        const user = req.user;

        try {
            const userDownloads = await DownloadsService.getUserDownloads(user); 
            return res.status(200).json(userDownloads)
        } catch (error) {
            return next(error);
        }
    }

    static async downloadFile(req: AuthRequest, res: Response, next: NextFunction) {
        const download_id = req.params.download_id;
        if(!download_id) {
            return next(
                new AppError(
                    "Download ID is required.",
                    400,
                    ErrorTypes.BAD_REQUEST
                )
            )
        }

        try {
            const { fileName, fileStream } = await DownloadsService.getDownloadFileStream(download_id);

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

            fileStream.pipe(res);
        } catch (error) {
            return next(error);
        }
    }
}