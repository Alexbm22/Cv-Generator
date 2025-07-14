import { StoreApi } from "zustand";
import { CVStore } from "../interfaces/cv";
import { useAuthStore, useCVsStore, useErrorStore } from "../Store";
import { CVServerService } from "./CVServer";
import { AppError } from "./Errors";
import { ErrorTypes } from "../interfaces/error";
import { saveToIndexedDB } from "../lib/indexedDB/cvStore";

export class CVLocalService {
    private static isProcessing = false;

    public static async persistAllCVs(api: StoreApi<CVStore>) {    

        if (CVLocalService.isProcessing) {
            return;
        }

        CVLocalService.isProcessing = true;

        const { isSyncStale } = api.getState();
        const { isAuthenticated } = useAuthStore.getState();

        if(!isAuthenticated) return;

        if(isSyncStale()) {
            try {
                const { CVs } = useCVsStore.getState();
                const res = await CVServerService.syncToServer(CVs);
                if(res.data){
                    const { setFetchedCVs } = api.getState();
                    setFetchedCVs(res.data);
                }
            } catch (error) {
                const response = typeof error === "object" && error && "response" in error
                    ? (error as any).response
                    : undefined;

                const err = new AppError(
                    response.response?.data.message || "Something went wrong!",
                    response.response?.status || 500,
                    response.response?.data.errType || ErrorTypes.INTERNAL_ERR
                )
                useErrorStore.getState().addError(err);
                useCVsStore.getState().setCVs([]);
            }
        } else {
            const CVs = api.getState().CVs;
            saveToIndexedDB(CVs);
        }
        
        CVLocalService.isProcessing = false;
    }
}

