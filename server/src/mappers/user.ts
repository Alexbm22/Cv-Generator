import { PublicUserAttributes, UserPreferences, UserWithMediaFiles } from "@/interfaces/user";
import { AppError } from "@/middleware/error_middleware";
import { ErrorTypes } from "@/interfaces/error";

export const mapServerUserToPublicUser = async (user: UserWithMediaFiles): Promise<PublicUserAttributes> => {
    
    const userData = user.get();

    // Public data is only built for registered accounts, which always have these fields.
    if (!userData.email || !userData.username) {
        throw new AppError('Registered account is missing profile data', 500, ErrorTypes.INTERNAL_ERR);
    }

    return {
        id: userData.public_id,
        email: userData.email,
        username: userData.username,
        profilePictureId: user.mediaFile?.get('public_id'),
        needsInitialSync: userData.needsInitialSync,
        authProvider: userData.authProvider,
        useProfilePictureAsDefault: userData.useProfilePictureAsDefault,
        hasPassword: userData.password !== null,
    };
}

export const mapUserPreferences = (user: UserWithMediaFiles): UserPreferences => {
    const userData = user.get();

    return {
        useProfilePictureAsDefault: userData.useProfilePictureAsDefault,
        customColors: userData.customColors
    }
}