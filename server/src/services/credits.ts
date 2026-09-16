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
        if (currentCredits === undefined) {
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
        const normalizedAmount = Number.isFinite(amount) ? Math.trunc(amount) : NaN;
        if (normalizedAmount <= 0) {
            throw new AppError(
                'Credits amount must be a positive integer.',
                400,
                ErrorTypes.BAD_REQUEST
            );
        }

        // Use an atomic DB increment to avoid lost updates under concurrency.
        const { userCredits } = await downloadCreditsRepository.findOrCreateUserCredits(user_id, 0);
        await userCredits.increment('credits', { by: normalizedAmount });
        await userCredits.reload();

        return userCredits;
    }

    @handleServiceError('Failed to delete user credits')
    static async deleteUserCredits(user_id: number) {
        const deletedCount = await downloadCreditsRepository.deleteUserCredits(user_id);
        return deletedCount;
    }
}