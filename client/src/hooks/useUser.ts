import { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ApiError } from "../interfaces/error";
import { getGuestCVs, syncCVs } from "../services/CVLocal";
import { UserServerService } from "../services/UserServer";
import { SyncedDataAttributes, UserProfile } from "../interfaces/user";
import { UserServices } from "../services/user";
import { useAuthStore } from "../Store";
import { useUserStore } from "../Store/useUserStore";
import { queryClient } from "../queryClient";

export const refreshUserProfile = async () => {
    const profile = await UserServices.fetchUserProfile();
    queryClient.setQueryData<UserProfile>(['userProfile'], profile);
    useUserStore.getState().setUserProfile(profile);
    return profile;
};

// Stripe webhooks update the DB asynchronously, so the profile may not reflect a payment right away.
export const waitForUserProfile = async (
    isReady: (profile: UserProfile) => boolean,
    attempts = 6,
    delayMs = 1500
) => {
    for (let attempt = 1; attempt <= attempts; attempt++) {
        const profile = await refreshUserProfile();
        if (isReady(profile)) return true;
        if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    return false;
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