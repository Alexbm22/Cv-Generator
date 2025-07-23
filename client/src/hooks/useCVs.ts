import { useMutation } from "@tanstack/react-query"
import { useAuthStore, useCVsStore } from "../Store";
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
