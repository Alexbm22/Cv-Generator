import { PublicUserAttributes, UserPreferences, UserWithMediaFiles } from "@/interfaces/user";

export const mapServerUserToPublicUser = async (user: UserWithMediaFiles): Promise<PublicUserAttributes> => {
    
    const userData = user.get();

    return {
        id: userData.public_id,
        email: userData.email,
        username: userData.username,
        profilePictureId: user.mediaFile?.get('public_id'),
        needsInitialSync: userData.needsInitialSync,
        authProvider: userData.authProvider,
        useProfilePictureAsDefault: userData.useProfilePictureAsDefault,
    };
}

export const mapUserPreferences = (user: UserWithMediaFiles): UserPreferences => {
    const userData = user.get();

    return {
        useProfilePictureAsDefault: userData.useProfilePictureAsDefault,
        customColors: userData.customColors
    }
}