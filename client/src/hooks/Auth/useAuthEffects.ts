import { useAuthStore } from "../../Store";
import { useCheckAuth } from "./useAuth";
import { useEffect } from "react";

export const useAuthEffects = () => {
  const { mutate: checkAuth } = useCheckAuth();

  const isAuthChecked = useAuthStore((state) => state.isAuthChecked);

  useEffect(() => {
    if (!isAuthChecked){
      checkAuth();
    }
  }, [checkAuth, isAuthChecked])
};