import { StoreApi } from "zustand";
import { CVStore } from "../interfaces/cv";
import { useAuthStore, useCVsStore, useErrorStore } from "../Store";
import { CVServerService } from "./CVServer";

export class CVLocalService {
    private static isProcessing = false;

    public static async syncCVs() {
        const { getChangedCVs, setCVs, setLastSynced } = useCVsStore.getState();

        try {
            const res = await CVServerService.sync(getChangedCVs());
    
            // to do: separate the sync logic from the fetch logic
            if(res){ // handling version conflicts
                setCVs(res);
            }
        } catch (error) {
            useErrorStore.getState().createError(error);
            useCVsStore.getState().setCVs([]);
        } finally {
            setLastSynced();
        }
    }
    
    public static async fetchCVs() {
        const { setCVs, setlastFetched } = useCVsStore.getState();

        try {
            const fetchedCVs = await CVServerService.fetch();
    
            setCVs(fetchedCVs);
            setlastFetched();
        } catch (error) {
            useErrorStore.getState().createError(error);
            useCVsStore.getState().setCVs([]);
        } finally {
            setlastFetched();
        }
    }

    // to do correct the hydration logic 
    public static async handleCVsHydration(api: StoreApi<CVStore>) {    
        if (CVLocalService.isProcessing) return;
        CVLocalService.isProcessing = true;
        
        const { 
            isSyncStale, 
            isFetchStale
        } = api.getState();
        const { isAuthenticated } = useAuthStore.getState();
        
        if(isAuthenticated){
            if(isSyncStale()) {
                await this.syncCVs();
            } else if(isFetchStale()) {
                await this.fetchCVs();
            }
        }

        CVLocalService.isProcessing = false;
    }

}

