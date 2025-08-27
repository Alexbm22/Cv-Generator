import { StoreApi } from "zustand";
import { CVEditStore, CVStore } from "../interfaces/cv";
import { useAuthStore, useCVsStore, useErrorStore } from "../Store";
import { CVServerService } from "./CVServer";
import { debounce } from "lodash";

export class CVLocalService {

    // public static async fetchCV(cvId: string) {
    //     const { setCVs } = useCVsStore.getState();

    //     try {
    //         const fetchedCVs = await CVServerService.getCV(cvId);
    
    //         setCVs(fetchedCVs);
    //     } catch (error) {
    //         useErrorStore.getState().createError(error);
    //         useCVsStore.getState().setCVs([]);
    //     }
    // }


    public static autoSaveCV() {
        return debounce(async (api: StoreApi<CVEditStore>) => {
            const { getCVObject } = api.getState();
            const { setSelectedCV } = useCVsStore.getState();
            const updatedCV = getCVObject();
            
            await CVServerService.sync(updatedCV);
            setSelectedCV(updatedCV);
        }, 3000); // debounce for 3 seconds
    }

}

