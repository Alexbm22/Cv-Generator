import { useAuthStore } from "../../Store";
import { useInitialUserDataSync } from "../useUser";
import { useCheckAuth } from "./useAuth";
import { useEffect } from "react";

export const useAuthEffects = () => {
  const { mutate: checkAuth } = useCheckAuth();
  const { mutate: syncGuestData } = useInitialUserDataSync();

  const needsInitialSync = useAuthStore((state) => state.needsInitialSync);
  const isAuthChecked = useAuthStore((state) => state.isAuthChecked);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setIsLoadingAuth = useAuthStore((state) => state.setIsLoadingAuth);

  useEffect(() => {
    if (isAuthChecked || isAuthenticated) {
      setIsLoadingAuth(false);
      return;
    }

    checkAuth();
  }, [])

  useEffect(() => {
    if (isAuthChecked) {
      setIsLoadingAuth(false);
    }
  }, [isAuthChecked, setIsLoadingAuth]);

  // handle sync guest data
  useEffect(() => {
    if (isAuthenticated && needsInitialSync) {
      syncGuestData();
    }
  }, [isAuthenticated, needsInitialSync, syncGuestData]);
};