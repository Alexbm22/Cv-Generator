import { useMutation } from "@tanstack/react-query"
import { apiService } from "../services/api"
import { useErrorStore } from "../Store";

export const useDownload = () => {
    return useMutation({
        mutationFn: async () => {
            return await apiService.post<void>('/protected/downloads/initiate');
        },
        onSuccess: () => {
            // handle download
        }, 
        onError: (error) => {
            useErrorStore.getState().createError(error);
        }
    })
}