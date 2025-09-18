import { StoreApi } from "zustand";
import { CVEditStore, CVStateMode } from "../interfaces/cv";
import { useCVsStore } from "../Store";
import { CVServerService } from "./CVServer";
import { debounce } from "lodash";

export class CVLocalService {

    public static autoSaveCV() {
        return debounce(async (api: StoreApi<CVEditStore>) => {

            console.log("se updateaza")

            const { getUserCVObject, getGuestCVObject } = api.getState();
            const { 
                CVState, 
                setUserSelectedCV, 
                setGuestSelectedCV,
                updateGuestCV
            } = useCVsStore.getState();
            
            if(CVState.mode === CVStateMode.USER) {
                const updatedCV = getUserCVObject();

                await CVServerService.sync(updatedCV);
                setUserSelectedCV(updatedCV);
            } else {
                const updatedCV = getGuestCVObject();

                updateGuestCV(updatedCV);
                setGuestSelectedCV(updatedCV);
            }
        }, 4000);
    }

}

