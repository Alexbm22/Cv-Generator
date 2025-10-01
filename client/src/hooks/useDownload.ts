import { useMutation } from "@tanstack/react-query"
import { useErrorStore } from "../Store";
import { DownloadService } from "../services/download";
import { TemplateMap } from "../constants/CV/TemplatesMap";
import { generatePdfBlob } from "../services/Pdf";
import { ApiError } from "../interfaces/error";
import { CVServerService } from "../services/CVServer";
import { UserCVAttributes } from "../interfaces/cv";

type onDownloadSuccessProps = {
    PdfBlob: Blob;
    CVData: UserCVAttributes
}

export const useDownload = () => {
    return useMutation<onDownloadSuccessProps, ApiError, any>({
        mutationFn: async (CVId: string) => {

            const CVData = await CVServerService.getCV(CVId);

            const TemplateComponent = TemplateMap[CVData.template];
            const CVToDownload = {
                ...CVData,
                photo: CVData.photo?.presigned_get_URL!
            };

            const PdfBlob = await generatePdfBlob(TemplateComponent, {CV: CVToDownload})
            
            await DownloadService.createDownload(PdfBlob, CVData)

            const DownloadData = {
                PdfBlob,
                CVData
            }

            return DownloadData;

        },
        onSuccess: async (DownloadData) => {
            await DownloadService.downloadPdf(DownloadData.PdfBlob, DownloadData.CVData);
        }, 
        onError: (error) => {
            useErrorStore.getState().createError(error);
        }
    })
}