import { useMutation } from "@tanstack/react-query"
import { loadAllCVs } from "../lib/indexedDB/cvStore";
import { useCVsStore } from "../Store";
import { CVAttributes } from "../interfaces/cv_interface";

export const useHydrateCVs = () => {
    return useMutation<CVAttributes[], Error>({
        mutationFn: async () => {
            const CVs = await loadAllCVs();
            if(!CVs){
                return [];
            }
            return CVs;
        },
        onSuccess: (CVs) => {
            const { setdbHydrated, setCVs } = useCVsStore.getState();
            
            setCVs(CVs);
            setdbHydrated(true);
        }
    })
}
