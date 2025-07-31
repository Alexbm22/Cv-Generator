import { useMutation } from "@tanstack/react-query"
import { useCvEditStore, useErrorStore } from "../Store";
import { DownloadService } from "../services/download";
import { CVAttributes } from "../interfaces/cv";
import { TemplateMap } from "../constants/CV/TemplatesMap";

export const useDownload = (
    CVToDownload: CVAttributes
) => {
    return useMutation({
        mutationFn: async () => await DownloadService.initiateDownload(CVToDownload),
        onSuccess: async () => {
            const { 
                setCV, 
                id, // selected cv id,
                template
            } = useCvEditStore.getState();

            if(!(id === CVToDownload.id)) { 
                setCV(CVToDownload);
            }

            const TemplateComponent = TemplateMap[template]

            await DownloadService.downloadPdf(TemplateComponent, CVToDownload);
        }, 
        onError: (error) => {
            useErrorStore.getState().createError(error);
        }
    })
}