import { PublicUserAttributes, UserWithMediaFiles } from "@/interfaces/user";
import { MediaFilesServices } from "@/services/mediaFiles";

const mapServerUserToPublicUser = async (user: UserWithMediaFiles): Promise<PublicUserAttributes> => {
    
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

export default {
    mapServerUserToPublicUser
}