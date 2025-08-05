import { SubscriptionStatus } from "../interfaces/subscriptions";
import { PublicCVAttributes } from "../interfaces/cv";
import { ErrorTypes } from "../interfaces/error";
import { AppError } from "../middleware/error_middleware";
import { User, CV, Subscriptions } from "../models";
import { CreditsService } from "./credits";

export class DownloadsService {


    static async initDownload(user: User, downloadedCV: PublicCVAttributes, file?: Express.Multer.File) {

        if(!file) {
            throw new AppError(
                "No file provided for download.",
                400,
                ErrorTypes.BAD_REQUEST
            )
        }

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

        // it will throw an error if the user does not have permission to download
        await this.hasDownloadPermission(userData.id);

        // to do add the cv in the downloads table

        return;
    }

    static async hasDownloadPermission(user_id: number) {
        const hasSubscription = await Subscriptions.findOne({
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