import { AppError } from "../middleware/error_middleware";
import { DownloadCredits } from "../models";
import { ErrorTypes } from "../interfaces/error";

export class CreditsService {
    static async addCredits(user_id: number, amount: number) {
        try {
            const userCredits = await DownloadCredits.findOne({ where: { user_id } });
            if (userCredits) {
                userCredits.set('credits', userCredits.credits + amount);
                await userCredits.save();
            } else {
                await DownloadCredits.create({ user_id, credits: amount });
            }
        } catch (error) {
            throw new AppError(
                "Failed to add credits",
                500,
                ErrorTypes.INTERNAL_ERR
            )
        }
    }
}