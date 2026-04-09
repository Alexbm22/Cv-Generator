import { useEffect, useState } from "react";
import { useAuthStore } from "../Store";
import { isUrlValid } from "../utils/urls";

const DEFAULT_PICTURE = "/Images/anonymous_Picture.png";

const useProfilePictureUrl = () => {    
    const profilePicture = useAuthStore(state => state.profilePicture);
    const [profilePictureUrl, setProfilePictureUrl] = useState(DEFAULT_PICTURE);
    const [isProfilePictureValid, setIsProfilePictureValid] = useState(false);

    useEffect(() => {
        const url = profilePicture?.is_active ? profilePicture.get_URL : null;

        if (!url) {
            setProfilePictureUrl(DEFAULT_PICTURE);
            setIsProfilePictureValid(false);
            return;
        }

        let cancelled = false;

        isUrlValid(url).then((isValid) => {
            if (cancelled) return;
            if (isValid) {
                setProfilePictureUrl(url);
                setIsProfilePictureValid(true);
            } else {
                console.warn(`Profile picture URL is not accessible: ${url}`);
                setProfilePictureUrl(DEFAULT_PICTURE);
                setIsProfilePictureValid(false);
            }
        });

        return () => { cancelled = true; };
    }, [profilePicture?.get_URL, profilePicture?.is_active]);

  return {
    profilePictureUrl,
    isProfilePictureValid,
  }
};

export default useProfilePictureUrl;
