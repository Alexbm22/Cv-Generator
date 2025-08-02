import { useMutation } from "@tanstack/react-query"
import { useCvEditStore, useErrorStore } from "../Store";
import { DownloadService } from "../services/download";
import { CVAttributes } from "../interfaces/cv";
import { TemplateMap } from "../constants/CV/TemplatesMap";
import { generatePdfBlob } from "../services/Pdf";
import { ApiError } from "../interfaces/error";

export const useDownload = (
    CVToDownload: CVAttributes
) => {
    return useMutation<Blob, ApiError, any>({
        mutationFn: async () => {
            const { 
                setCV, 
                id, // selected cv id,
                template
            } = useCvEditStore.getState();
            
            if(!(id === CVToDownload.id)) { 
                setCV(CVToDownload); 
            }
            
            const TemplateComponent = TemplateMap[template]
            const PdfBlob = await generatePdfBlob(TemplateComponent, {CV: CVToDownload})
            
            await DownloadService.initiateDownload(PdfBlob, CVToDownload)
            return PdfBlob; // Return the generated PDF blob if no errors occurred during the api request
        },
        onSuccess: async (PdfBlob) => {
            await DownloadService.downloadPdf(PdfBlob, CVToDownload);
        }, 
        onError: (error) => {
            useErrorStore.getState().createError(error);
        }
    })
}