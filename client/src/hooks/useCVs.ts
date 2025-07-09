import { useMutation } from "@tanstack/react-query"
import { loadAllCVs } from "../lib/indexedDB/cvStore";
import { useAuthStore, useCVsStore, useErrorStore } from "../Store";
import { CVAttributes } from "../interfaces/cv_interface";
import { AppError } from "../services/Errors";
import { ApiError, ErrorTypes } from "../interfaces/error_interface";
import { CVServerService } from "../services/CVServer";
import { storeConfig } from "../Store/config/storeConfig";
import { ApiResponse } from "../interfaces/api_interface";

export const useCreateCV = () => {
    const addCV = useCVsStore(state => state.addCV);
    const defaultCVData = storeConfig.defaultStates.CVObject()
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);

    return useMutation<CVAttributes, ApiError>({
        mutationFn: async () => {
            return isAuthenticated ? (await CVServerService.createNewCV()).data! : defaultCVData;
        },
        onSuccess: (cv) => {
            addCV(cv);
        }
    })
}

export const useSyncToServer = () => {
    return useMutation<ApiResponse<CVAttributes[] | null> | null, ApiError>({
        mutationFn: async () => {
            const { getChangedCVs } = useCVsStore.getState();
            const changedCVs = getChangedCVs(); // syncing just the updated CVs

            return (changedCVs.length > 0 ? await CVServerService.syncToServer(changedCVs) : null)
        },
        onSuccess: (syncRes) => {
            if(!syncRes?.success && syncRes?.data) {
                const CVs = syncRes.data;
                
                const { setFetchedCVs } = useCVsStore.getState();
                setFetchedCVs(CVs);
            } else {
                useCVsStore.getState().setLastSynced(new Date().getTime());
            }
        },
        onError: (error) => {
            const err = new AppError(
                error.response?.data.message || "Something went wrong!",
                error.response?.status || 500,
                error.response?.data.errType || ErrorTypes.INTERNAL_ERR
            )
            useErrorStore.getState().addError(err);
            useCVsStore.getState().setCVs([]);
        }
    })
}

export const useIndexedDBHydrate = () => {
    return useMutation<CVAttributes[], ApiError>({
        mutationFn: async () => {
            const CVs = await loadAllCVs();
            return CVs ?? [];
        },
        onSuccess: (CVs) => {
            const { setdbHydrated, setCVs } = useCVsStore.getState();

            setCVs(CVs);
            setdbHydrated(true);
        },
        onError: (error) => {
            const err = new AppError(
                error.response?.data.message || "Something went wrong!dfsfsdfsd",
                error.response?.status || 500,
                error.response?.data.errType || ErrorTypes.INTERNAL_ERR
            )
            useErrorStore.getState().addError(err);
        }
    })
}

export const useFetchCVs = () => {
    return useMutation<CVAttributes[], ApiError>({
        mutationFn: async () => {
            return (await CVServerService.fetchFromServer()).data ?? [];
        },
        onSuccess: (CVs) => {
            const { setFetchedCVs } = useCVsStore.getState();
            setFetchedCVs(CVs);
        },
        onError: (error) => {
            const err = new AppError(
                error.response?.data.message || "Something went wrong!",
                error.response?.status || 500,
                error.response?.data.errType || ErrorTypes.INTERNAL_ERR
            )
            useErrorStore.getState().addError(err);
            useCVsStore.getState().setCVs([]);
        }
    })
}
