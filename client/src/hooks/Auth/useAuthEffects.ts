import { useAuthStore } from "../../Store";
import { useCheckAuth } from "./useAuth";
import { useEffect } from "react";

export const useAuthEffects = () => {
  const { mutate: checkAuth } = useCheckAuth();
  const isAuthChecked = useAuthStore((state) => state.isAuthChecked);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setIsLoadingAuth = useAuthStore((state) => state.setIsLoadingAuth);

  useEffect(() => {
    // Dacă auth-ul a fost deja verificat sau utilizatorul este deja autentificat, nu mai verificăm
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
};