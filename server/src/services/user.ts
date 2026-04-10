import { InitialDataSyncAttributes, PublicUserAttributes, ServerUserAttributes, UserWithMediaFiles, SyncedDataAttributes, UserCreationAttributes, UserAccountDetails } from "@/interfaces/user";
import { User } from "@/models";
import { generateRandomSuffix } from '@/utils/stringUtils/generateRandomSuffix'
import userRespository from '@/repositories/user';
import { AppError } from "@/middleware/error_middleware";
import { ErrorTypes } from "@/interfaces/error";
import { handleServiceError } from '@/utils/serviceErrorHandler';
import { userMappers } from "@/mappers";
import { CVsService } from "./cv";
import { DownloadsService } from "./downloads";

export class UserService {

    static async getUser(criteria: Partial<ServerUserAttributes>): Promise<User | null> {
        return await userRespository.getUserByFields(criteria);
    }

    static async getUserWithMediaFile(criteria: Partial<ServerUserAttributes>) {
        return await userRespository.getUserWithMediaFile(criteria);
    }

    static async createUser(userData: UserCreationAttributes) {
        return await userRespository.createUser(userData);
    }

    static async saveUserChanges(updates: Partial<ServerUserAttributes>, userInstance: User) {
        await userRespository.saveUserChanges(updates, userInstance);
    }

    static async getUserPublicData(userInstance: UserWithMediaFiles): Promise<PublicUserAttributes> {
        return await userMappers.mapServerUserToPublicUser(userInstance);
    }

    @handleServiceError('Password change failed')
    static async changePassword(user: User, currentPassword: string, newPassword: string): Promise<void> {
        const userData = user.get();
        if (userData.authProvider === 'google') {
            throw new AppError('Password change not allowed for Google-authenticated users', 400, ErrorTypes.VALIDATION_ERR);
        }

        const isCurrentPasswordValid = await user.comparePasswords(currentPassword);
        if (!isCurrentPasswordValid) {
            throw new AppError('Current password is incorrect', 400, ErrorTypes.VALIDATION_ERR);
        }

        await userRespository.saveUserChanges({ password: newPassword, tokenVersion: userData.tokenVersion + 1 }, user);
    }

    @handleServiceError('Failed to sync initial user data')
    static async syncInitialData(user: ServerUserAttributes, dataToSync: InitialDataSyncAttributes): Promise<SyncedDataAttributes> {
        const importedCVs = await CVsService.createCVs(user.id, dataToSync.cvs);
        await userRespository.updateUserByFields(
            { needsInitialSync: false }, 
            { id: user.id }
        );

        return {
            cvs: importedCVs
        }
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
    static async getAccountData(user: UserWithMediaFiles): Promise<UserAccountDetails> {
        const userData = await userMappers.mapServerUserToPublicUser(user);
        const activeCVs = await CVsService.countUserCVs(user.get().id);
        const totalDownloads = await DownloadsService.countTotalUserDownloads(user.get().id);

        return {
            username: userData.username,
            email: userData.email,
            profilePicture: userData.profilePicture,
            activeCVs,
            totalDownloads,
            memberSince: user.get()?.createdAt ? user.get().createdAt!.toDateString() : '',
        }
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
        const user = await User.findOne({where: { username }});
        return !user;
    }

    @handleServiceError('Failed to update profile picture preference')
    static async updateProfilePicturePreference(user: User, useAsDefault: boolean): Promise<{ useProfilePictureAsDefault: boolean }> {
        await userRespository.saveUserChanges({ useProfilePictureAsDefault: useAsDefault }, user);
        return { useProfilePictureAsDefault: useAsDefault };
    }

}