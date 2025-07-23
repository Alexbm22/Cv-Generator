import { useQuery } from "@tanstack/react-query";
import { useCVsStore, useErrorStore } from "../../Store";
import { CVServerService } from "../../services/CVServer";
import { useEffect } from "react";

export const useCVsEffects = () => {
  const lastSynced = useCVsStore(state => state.lastSynced);
  const _hasHydrated = useCVsStore(state => state._hasHydrated);
  const setCVs = useCVsStore(state => state.setCVs);
  const setLastSynced = useCVsStore(state => state.setLastSynced);
  const createError = useErrorStore(state => state.createError);

  const {
    data: CVs,
    isSuccess,
    isError,
    error,
  } = useQuery({
    queryKey: ['userCVs'],
    queryFn: () => CVServerService.fetch(),
    enabled: !lastSynced && _hasHydrated,
    retry: true,
  });

  useEffect(() => {
    if (CVs && isSuccess) setCVs(CVs);
    else if (isError && error) {
      createError(error);
      setCVs([]);
      setLastSynced();
    }
  }, [CVs, isSuccess, isError, error]);
};