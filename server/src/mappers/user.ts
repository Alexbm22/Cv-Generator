import { PresignedUrlType } from "@/interfaces/mediaFiles";
import { PublicUserAttributes, UserWithMediaFiles } from "@/interfaces/user";
import { MediaFilesServices } from "@/services/mediaFiles";
import { auth } from "google-auth-library";

const mapServerUserToPublicUser = async (user: UserWithMediaFiles): Promise<PublicUserAttributes> => {
    
    const userData = user.get();
    const userProfilePhoto= user.mediaFile?.get('is_active') ? await MediaFilesServices.getPublicMediaFileData(user.mediaFile) : undefined;

    return {
        id: userData.public_id,
        email: userData.email,
        username: userData.username,
        profilePicture: userProfilePhoto,
        needsInitialSync: userData.needsInitialSync,
        authProvider: userData.authProvider,
        useProfilePictureAsDefault: userData.useProfilePictureAsDefault,
    };
}

export default {
    mapServerUserToPublicUser
}