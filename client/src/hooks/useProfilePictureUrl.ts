import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "../Store";
import { useMediaFileQuery } from "./MediaFile/useMediaFileQuery";
import { useMediaFile } from "./MediaFile/useMediaFile";

const DEFAULT_PICTURE = "/Images/anonymous_Picture.png";

const useProfilePictureUrl = () => {
    const profilePictureId = useAuthStore(state => state.profilePictureId);
    const [profilePictureUrl, setProfilePictureUrl] = useState(DEFAULT_PICTURE);
    const [isProfilePictureValid, setIsProfilePictureValid] = useState(false);

    const { data: profilePicture, refetch } = useMediaFileQuery(profilePictureId!);
    const { getMediaFileGetUrl } = useMediaFile(profilePicture, refetch);

    const fetchProfilePictureUrl = useCallback(async () => {
        if (profilePicture) {
            try {
                const url = await getMediaFileGetUrl();
                setProfilePictureUrl(url ?? DEFAULT_PICTURE);
                setIsProfilePictureValid(!!url);
            } catch {
                setProfilePictureUrl(DEFAULT_PICTURE);
                setIsProfilePictureValid(false);
            }
        }
    }, [profilePicture, getMediaFileGetUrl]);


    useEffect(() => {
        void fetchProfilePictureUrl();
    }, [fetchProfilePictureUrl]);

    return {
        profilePictureUrl,
        isProfilePictureValid,
    };
};

export default useProfilePictureUrl;
