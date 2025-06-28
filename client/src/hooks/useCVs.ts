import { useMutation } from "@tanstack/react-query"
import { loadAllCVs } from "../lib/indexedDB/cvStore";
import { useCVsStore, useErrorStore } from "../Store";
import { CVAttributes } from "../interfaces/cv_interface";
import { AppError } from "../services/Errors";
import { ApiError, ErrorTypes } from "../interfaces/error_interface";
import CVServerService from "../services/CVServerService";

export const useCreateCV = () => {
    return useMutation<CVAttributes, ApiError>({
        mutationFn: async () => {
            return (await CVServerService.createNewCV()).data!
        },
        onSuccess: (cv) => {
            const { addCV } = useCVsStore.getState();
            addCV(cv);
        }
    })
}

export const useHydrateCVs = () => {
    const { isSyncStale } = useCVsStore.getState();
    if(isSyncStale()) {
        return useSyncToServer();
    } else {
        return useIndexedDBHydrate();
    }
}

export const useSyncToServer = () => {
    return useMutation<CVAttributes[], ApiError>({
        mutationFn: async () => {
            return (await CVServerService.syncToServer()).data ?? [];
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
                error.response?.data.message || "Something went wrong!",
                error.response?.status || 500,
                error.response?.data.errType || ErrorTypes.INTERNAL_ERR
            )
            useErrorStore.getState().addError(err);
            useCVsStore.getState().setCVs([]);
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
