import { SubscriptionStatus } from "../interfaces/subscriptions";
import { PublicCVAttributes } from "../interfaces/cv";
import { ErrorTypes } from "../interfaces/error";
import { AppError } from "../middleware/error_middleware";
import { User, CV, Subscription, Download } from "../models";
import { CreditsService } from "./credits";
import { S3Services } from "./s3";
import { config } from "../config/env";

const s3Services = new S3Services();

export class DownloadsService {


    static async initDownload(user: User, downloadedCV: PublicCVAttributes, file: Express.Multer.File) {
        const userData = user.get();

        // veryfy if the user is the owner of the CV
        const isOwner = await CV.findOne({
            where: {
                public_id: downloadedCV.id,
                user_id: userData.id
            }
        })

        if(!isOwner) {
            throw new AppError(
                "You are not authorized to download this CV",
                403,
                ErrorTypes.UNAUTHORIZED
            )
        }

        // throws an error if the user does not have permission to download
        await this.hasDownloadPermission(userData.id);

        const uploadResult = await s3Services.uploadToS3(file, config.AWS_S3_BUCKET);
        const uploadKey = uploadResult.Key;

        // add download to the downloads table
        const newDownload = await Download.create({
            metadata: downloadedCV,
            fileKey: uploadKey,
            fileName: file.originalname,
            user_id: userData.id
        });
    }

    static async getUserDownloads(user: User) {
        const userDownloads = await Download.findAll({
            where: {
                user_id: user.get().id
            }
        })

        const publicDowloadsData = userDownloads.map(download => download.toSafeDownload());
        return publicDowloadsData;
    }

    static async getDownloadFileStream(download_id: string) {

        const download = await Download.findOne({
            where: {
                public_id: download_id
            }
        })
        
        if(!download) {
            throw new AppError(
                "The requested file could not be found.",
                404,
                ErrorTypes.NOT_FOUND
            )
        }

        const downloadData = download.get();
        const fileStream = await s3Services.getFromS3(
            downloadData.fileKey,
            config.AWS_S3_BUCKET
        );

        return {
            fileName: downloadData.fileName,
            fileStream
        };
    }

    static async hasDownloadPermission(user_id: number) {
        const hasSubscription = await Subscription.findOne({
            where: {
                user_id,
                status: SubscriptionStatus.ACTIVE
            }
        })
        const userCredits = await CreditsService.getUserCredits(user_id);

        // if the user has an active subscription or enough credits, allow download
        if(hasSubscription) {
            return;
        } else if(userCredits > 0) {
            const consumedCredits = await CreditsService.consumeCredit(user_id, userCredits);
            if(consumedCredits) {
                return;
            }
        } else {
            throw new AppError(
                "You do not have download permissions. Please subscribe or purchase credits.",
                403,
                ErrorTypes.UNAUTHORIZED
            )
        }
    } 
}