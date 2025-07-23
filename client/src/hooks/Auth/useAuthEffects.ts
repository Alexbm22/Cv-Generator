import { useQuery } from "@tanstack/react-query";
import { useAuthStore, useUserStore } from "../../Store";
import { useCheckAuth } from "./useAuth";
import { UserServices } from "../../services/user";
import { useEffect } from "react";

export const useAuthEffects = () => {
  const { mutate: checkAuth } = useCheckAuth();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setUserProfile = useUserStore(state => state.setUserProfile);
  const clearUserProfile = useUserStore(state => state.clearUserProfile);

  const {
    data: profile,
    isSuccess,
    isError,
  } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => UserServices.fetchUserProfile(),
    enabled: isAuthenticated,
    staleTime: 60000,
  });

  useEffect(() => {
    if (!isAuthenticated) checkAuth();
  }, [isAuthenticated, checkAuth]);

  useEffect(() => {
    if (profile && isSuccess) setUserProfile(profile);
    else if (isError) clearUserProfile();
  }, [profile, isSuccess, isError]);
};