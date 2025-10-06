import { UserAttributes, UserCreationAttributes, UserProfile } from "@/interfaces/user";
import { User } from "@/models";
import { SubscriptionService } from "@/services/subscriptions";
import { CreditsService } from "@/services/credits";
import { PaymentService } from "@/services/payments";
import { generateRandomSuffix } from '@/utils/stringUtils/generateRandomSuffix'
import userRespository from '@/repositories/user';
import { AppError } from "@/middleware/error_middleware";
import { ErrorTypes } from "@/interfaces/error";
import { handleServiceError } from '@/utils/serviceErrorHandler';

export class UserService {

    static async findUser(criteria: Partial<UserAttributes>): Promise<User | null> {
        return userRespository.getUserByFields(criteria);
    }

    static async createUser(userData: UserCreationAttributes) {
        return await userRespository.createUser(userData);
    }

    static async saveUserChanges(updates: Partial<UserAttributes>, userInstance: User) {
        await userRespository.saveUserChanges(updates, userInstance);
    }

    @handleServiceError('Failed to validate user credentials')
    static async validateNewUserCredentials(email: string, username: string) {
        const existingUsers = await userRespository.findExistingCredentials(email, username);

        const errors: Record<string, string> = {};
        
        existingUsers.forEach(user => {
            if (user.email === email) {
                errors.email = 'Email is already registered';
            }
            if (user.username === username) {
                errors.username = 'Username is already taken';
            }
        });

        if (Object.keys(errors).length > 0) {
            throw new AppError(
                'Validation failed', 
                409, 
                ErrorTypes.VALIDATION_ERR, 
                errors
            );
        }
    }

    @handleServiceError('Failed to get user profile')
    static async getUserProfile(user: User): Promise<UserProfile> {
        const userData = user.get()

        // add here any user profile data
        const userActiveSubscription = await SubscriptionService.getUserSubscription(userData.id);
        const userCredits = await CreditsService.getUserCredits(userData.id);
        const userPayments = await PaymentService.getUserPayments(userData.id);
        const accountData = user.toSafeUser();

        const userProfileData = {
            username: accountData.username,
            email: accountData.email,
            profilePicture: accountData.profilePicture,
            subscription: userActiveSubscription,
            credits: userCredits,
            payments: userPayments
        }

        return userProfileData
    }

    @handleServiceError('Failed to generate username')
    static async generateUsername(given_name?: string, family_name?: string): Promise<string> {
            // Sanitize and normalize input names
            const sanitizedNames = [given_name, family_name]
                .map(name => name?.trim().toLowerCase())
                .filter(Boolean);

            // Generate base username
            const baseUsername = sanitizedNames.length > 0 
                ? sanitizedNames.join('-')
                : 'user';

            // Try base username first
            if (await this.isUniqueUsername(baseUsername)) {
                return baseUsername;
            }

            // Try with increasing suffix length
            const maxAttempts = 3;
            const maxSuffixLength = 8;
            
            for (let suffixLen = 4; suffixLen <= maxSuffixLength; suffixLen++) {
                // Try multiple times with current length
                for (let attempt = 0; attempt < maxAttempts; attempt++) {
                    const username = `${baseUsername}-${generateRandomSuffix(suffixLen)}`;
                    
                    if (await this.isUniqueUsername(username)) {
                        return username;
                    }
                }
            }

            // Fallback: timestamp + longer random suffix
            const timestamp = Date.now().toString(36); // Base36 for shorter string
            const fallbackUsername = `user-${timestamp}-${generateRandomSuffix(8)}`;
            
            if (await this.isUniqueUsername(fallbackUsername)) {
                return fallbackUsername;
            }

            throw new AppError(
                'Failed to generate unique username after multiple attempts',
                500,
                ErrorTypes.INTERNAL_ERR
            );
    }

    @handleServiceError('Failed to check username uniqueness')
    static async isUniqueUsername(username: string): Promise<boolean> {
        const user = await User.findOne({where: { username }})
        if(user) return false;
        return true;
    }

}