import { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ApiError } from "../interfaces/error";
import { getGuestCVs, syncCVs } from "../services/CVLocal";
import { UserServerService } from "../services/UserServer";
import { SyncedDataAttributes, UserProfile } from "../interfaces/user";
import { UserServices } from "../services/user";
import { useAuthStore } from "../Store";
import { useUserStore } from "../Store/useUserStore";

export const refreshUserProfile = async () => {
    const profile = await UserServices.fetchUserProfile();
    useUserStore.getState().setUserProfile(profile);
    return profile;
};

export const useUserProfile = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const setUserProfile = useUserStore((state) => state.setUserProfile);

    const userProfileQuery = useQuery<UserProfile, ApiError>({
        queryKey: ['userProfile'],
        queryFn: () => UserServices.fetchUserProfile(),
        enabled: isAuthenticated,
        retry: true,
        staleTime: 60 * 1000,
    });

    useEffect(() => {
        if (userProfileQuery.data) {
            setUserProfile(userProfileQuery.data);
        }
    }, [userProfileQuery.data, setUserProfile]);

    return userProfileQuery;
};

export const useInitialUserDataSync = () => {

    return useMutation<SyncedDataAttributes, ApiError>({
        mutationFn: async () => { 
            const guestCVs = getGuestCVs();
            console.log("Syncing initial user data with guest CVs:", guestCVs);
            return await UserServerService.syncInitialData({
                cvs: guestCVs
            });
        },
        onSuccess: async (syncResponse) => {
            const createdCVs = syncResponse.cvs;

            syncCVs(createdCVs);
        },
        onError: (error) => {
            console.error("Error during initial CVs sync:", error);
        }
    })
}