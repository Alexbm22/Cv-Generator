import { StoreApi } from "zustand";
import { CVStore } from "../interfaces/cv";
import { useAuthStore, useCVsStore, useErrorStore } from "../Store";
import { CVServerService } from "./CVServer";

export class CVLocalService {
    private static isProcessing = false;

    public static async syncCVs() {
        try {
            const { getChangedCVs, setCVs, setLastSynced } = useCVsStore.getState();
            const res = await CVServerService.sync(getChangedCVs());
    
            if(res){ // handling version conflicts
                setCVs(res);
                setLastSynced();
            }
        } catch (error) {
            useErrorStore.getState().createError(error);
            useCVsStore.getState().setCVs([]);
        }
    }
    
    public static async fetchCVs() {
        try {
            const { setCVs, setlastFetched } = useCVsStore.getState();
            const fetchedCVs = await CVServerService.fetch();
    
            setCVs(fetchedCVs);
            setlastFetched();
        } catch (error) {
            useErrorStore.getState().createError(error);
            useCVsStore.getState().setCVs([]);
        }
    }

    public static async handleCVHydration(api: StoreApi<CVStore>) {    
        if (CVLocalService.isProcessing) return;
        CVLocalService.isProcessing = true;
        
        const { 
            isSyncStale, 
            isFetchStale
        } = api.getState();
        const { isAuthenticated } = useAuthStore.getState();
        
        if(isAuthenticated){
            if(isFetchStale()) {
                await this.fetchCVs();
            } 
            else if(isSyncStale()) {
                await this.syncCVs();
            }
        }

        CVLocalService.isProcessing = false;
    }

}

