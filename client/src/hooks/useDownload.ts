import { useMutation } from "@tanstack/react-query"
import { apiService } from "../services/api"
import { useCvEditStore, useErrorStore } from "../Store";
import { DownloadService } from "../services/download";
import { CVAttributes } from "../interfaces/cv";
import MyCV from "../components/features/CVEditor/templates/hermes";

export const useDownload = (
    CVToDownload: CVAttributes
) => {
    return useMutation({
        mutationFn: async () => await DownloadService.initiateDownload(CVToDownload),
        onSuccess: async () => {
            const { 
                setCV, 
                id // selected cv id
            } = useCvEditStore.getState();

            if(!(id === CVToDownload.id)) { 
                setCV(CVToDownload);
            }

            await DownloadService.downloadPdf(MyCV, CVToDownload.title);
        }, 
        onError: (error) => {
            useErrorStore.getState().createError(error);
        }
    })
}