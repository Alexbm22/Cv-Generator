import { useMutation } from "@tanstack/react-query"
import { useAuthStore, useCvEditStore, useCVsStore } from "../../Store";
import { CVAttributes, CVMetadataAttributes } from "../../interfaces/cv";
import { ApiError } from "../../interfaces/error";
import { CVServerService } from "../../services/CVServer";
import { createDefaultCVObject } from "../../utils/cv";
import { useNavigate } from "react-router-dom";
import { routes } from "../../router/routes";

export const useCreateCV = () => {
    const addCV = useCVsStore(state => state.addCV);
    //  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

    return useMutation<CVMetadataAttributes, ApiError>({
        mutationFn: async () => { // To adjust this for not authenticated users
            return (await CVServerService.createNewCV()); // just for test
        },
        onSuccess: (cv) => {
            addCV(cv);
        }
    })
}



export const useDeleteCV = (CVId: string) => {
    const removeCV = useCVsStore(state => state.removeCV);
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);

    return useMutation<null, ApiError>({
        mutationFn: async () => {
            return isAuthenticated ? (await CVServerService.deleteCV(CVId)) : null;
        },
        onSuccess: () => {
            removeCV(CVId);
        }
    })
}

