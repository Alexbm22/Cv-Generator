import { AppError } from "@/middleware/error_middleware";
import { ErrorTypes } from "@/interfaces/error";
import downloadCreditsRepository from '@/repositories/downloadCredits';
import { handleServiceError } from '@/utils/serviceErrorHandler';

export class CreditsService {
    @handleServiceError('Failed to get user credits')
    static async getUserCredits(user_id: number): Promise<number> {
        const userCredits = await downloadCreditsRepository.getUserCredits(user_id);
        return userCredits ? userCredits.get().credits : 0;
    }

    @handleServiceError('Failed to deduct credit')
    static async deductCredit(user_id: number, currentCredits?: number): Promise<boolean> {
        if(!currentCredits) {
            const userCredits = await this.getUserCredits(user_id);
            if (userCredits <= 0) {
                throw new AppError(
                    "Insufficient credits available for this operation",
                    403,
                    ErrorTypes.UNAUTHORIZED
                );
            } else {
                currentCredits = userCredits;
            }
        }
        return await downloadCreditsRepository.updateCredits(user_id, currentCredits - 1);
    }

    @handleServiceError('Failed to add credits')
    static async addCredits(user_id: number, amount: number) {
        const { userCredits, created } = await downloadCreditsRepository.findOrCreateUserCredits(user_id, amount);
        
        if (!created) {
            userCredits.set('credits', userCredits.credits + amount);
            await userCredits.save();
        }
        
        return userCredits;
    }
}