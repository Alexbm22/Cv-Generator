import { useMutation } from "@tanstack/react-query"
import { loadAllCVs } from "../lib/indexedDB/cvStore";
import { useAuthStore, useCVsStore, useErrorStore } from "../Store";
import { CVAttributes } from "../interfaces/cv";
import { ApiError } from "../interfaces/error";
import { CVServerService } from "../services/CVServer";
import { storeConfig } from "../Store/config/storeConfig";

export const useCreateCV = () => {
    const addCV = useCVsStore(state => state.addCV);
    const defaultCVData = storeConfig.defaultStates.CVObject()
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);

    return useMutation<CVAttributes, ApiError>({
        mutationFn: async () => {
            return isAuthenticated ? (await CVServerService.createNewCV()) : defaultCVData;
        },
        onSuccess: (cv) => {
            addCV(cv);
        }
    })
}

export const useSyncToServer = () => {
    return useMutation<CVAttributes[] | null, ApiError>({
        mutationFn: async () => {
            const { getChangedCVs } = useCVsStore.getState();
            const changedCVs = getChangedCVs(); // syncing just the updated CVs

            return (changedCVs.length > 0 ? await CVServerService.syncToServer(changedCVs) : null)
        },
        onSuccess: (syncRes) => {
            if(syncRes) {
                const CVs = syncRes;
                
                const { setFetchedCVs } = useCVsStore.getState();
                setFetchedCVs(CVs);
            } else {
                useCVsStore.getState().setLastSynced(new Date().getTime());
            }
        },
        onError: (error) => {
            useErrorStore.getState().createError(error);
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
            const { setCVs } = useCVsStore.getState();

            setCVs(CVs);
        },
        onError: (error) => {
            useErrorStore.getState().createError(error);
        }
    })
}

export const useFetchCVs = () => {
    return useMutation<CVAttributes[], ApiError>({
        mutationFn: async () => {
            return (await CVServerService.fetchFromServer()) ?? [];
        },
        onSuccess: (CVs) => {
            const { setFetchedCVs } = useCVsStore.getState();
            setFetchedCVs(CVs);
        },
        onError: (error) => {
            useErrorStore.getState().createError(error);
            useCVsStore.getState().setCVs([]);
        }
    })
}
