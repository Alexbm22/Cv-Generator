import { useMutation } from "@tanstack/react-query";
import { ApiError } from "../interfaces/error";
import { getGuestCVs, syncCVs } from "../services/CVLocal";
import { UserServerService } from "../services/UserServer";
import { SyncedDataAttributes } from "../interfaces/user";
export const useInitialUserDataSync = () => {

    return useMutation<SyncedDataAttributes, ApiError>({
        mutationFn: async () => { 
            const guestCVs = getGuestCVs();

            return await UserServerService.syncInitialData({
                cvs: guestCVs
            });
        },
        onSuccess: async (syncResponse) => {
            const createdCVs = syncResponse.cvs;

            syncCVs(createdCVs);
        },
        onError: (error) => {
            console.error("Error during initial CVs sync:", error);
        }
    })
}