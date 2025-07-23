import { StoreApi } from "zustand";
import { CVStore } from "../interfaces/cv";
import { useAuthStore, useCVsStore, useErrorStore } from "../Store";
import { CVServerService } from "./CVServer";

export class CVLocalService {
    private static isProcessing = false;

    public static async syncCVs() {
        const { getChangedCVs, setLastSynced } = useCVsStore.getState();

        try {
            await CVServerService.sync(getChangedCVs());
        } catch (error) {
            await this.fetchCVs();
        } finally {
            setLastSynced();
        }
    }
    
    public static async fetchCVs() {
        const { setCVs } = useCVsStore.getState();

        try {
            const fetchedCVs = await CVServerService.fetch();
    
            setCVs(fetchedCVs);
        } catch (error) {
            useErrorStore.getState().createError(error);
            useCVsStore.getState().setCVs([]);
        }
    }

    public static async handleCVsHydration(api: StoreApi<CVStore>) {    
        if (CVLocalService.isProcessing) return;
        CVLocalService.isProcessing = true;
        
        const { isSyncStale } = api.getState();
        const { isAuthenticated } = useAuthStore.getState();
        
        if(isAuthenticated){
            if(isSyncStale()) {
                await this.syncCVs();
            }
        }

        CVLocalService.isProcessing = false;
    }

}

