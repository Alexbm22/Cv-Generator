import { useAuthStore } from "../../Store";
import { useCheckAuth } from "./useAuth";
import { useEffect } from "react";

export const useAuthEffects = () => {
  const { mutate: checkAuth } = useCheckAuth();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) checkAuth();
  }, [isAuthenticated, checkAuth]);
};