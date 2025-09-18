import { useQuery } from "@tanstack/react-query";
import { useAuthStore, useCVsStore, useErrorStore } from "../../Store";
import { CVServerService } from "../../services/CVServer";
import { useEffect } from "react";

export const useCVsEffects = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  const setCVs = useCVsStore(state => state.setUserCVs);
  const createError = useErrorStore(state => state.createError);

  const {
    data: CVs,
    isSuccess,
    isError,
    error,
  } = useQuery({
    queryKey: ['userCVs'],
    queryFn: () => CVServerService.getCVs(),
    enabled: isAuthenticated,
    retry: true,
  });

  useEffect(() => {
    if (CVs && isSuccess) setCVs(CVs);
    else if (isError && error) {
      createError(error);
      setCVs([]);
    }
  }, [CVs, isSuccess, isError, error]);
};