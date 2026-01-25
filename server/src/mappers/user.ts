import { PresignedUrlType } from "@/interfaces/mediaFiles";
import { PublicUserAttributes, UserWithMediaFiles } from "@/interfaces/user";
import { MediaFilesServices } from "@/services/mediaFiles";

const mapServerUserToPublicUser = async (user: UserWithMediaFiles): Promise<PublicUserAttributes> => {
    
    const userData = user.get();

    const profilePictureMediaFile= user.mediaFile?.is_active ? await MediaFilesServices.getPublicMediaFileData(
        user.mediaFile,
        [PresignedUrlType.GET, PresignedUrlType.PUT, PresignedUrlType.DELETE]
    ) : undefined;

    const userProfilePhoto = profilePictureMediaFile ?? userData.googleProfilePictureURL;

    return {
        id: userData.public_id,
        email: userData.email,
        username: userData.username,
        profilePicture: userProfilePhoto ?? undefined,
        needsInitialSync: userData.needsInitialSync
    };
}

export default {
    mapServerUserToPublicUser
}