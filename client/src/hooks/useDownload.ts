import { useMutation } from "@tanstack/react-query"
import { useErrorStore } from "../Store";
import { DownloadService } from "../services/download";
import { TemplateMap } from "../constants/CV/TemplatesMap";
import { generatePdfBlob } from "../services/Pdf";
import { ApiError } from "../interfaces/error";
import { CVServerService } from "../services/CVServer";
import { useNavigate } from "react-router-dom";
import { routes } from "../router/routes";
import { DownloadAttributes } from "../interfaces/downloads";
import { fetchFile } from "../services/MediaFiles";

export const useDownload = () => {
    const navigate = useNavigate();

    return useMutation<DownloadAttributes | void, ApiError, any>({
        mutationFn: async (CVId: string) => {

            const CVData = await CVServerService.getCV(CVId);

            const TemplateComponent = TemplateMap[CVData.template];
            const CVToDownload = {
                ...CVData,
                photo: CVData.photo?.presigned_get_URL!
            };

            const validateRes = await DownloadService.validateDownload(CVData);
            if(validateRes.isDuplicate && validateRes.existingDownload) {
                return validateRes.existingDownload;
            } else if(!(validateRes.hasPermission && validateRes.validationToken)) {
                return navigate(routes.prices.path, { replace: true });
            }

            const PdfBlob = await generatePdfBlob(TemplateComponent, {CV: CVToDownload})

            return await DownloadService.executeDownload(PdfBlob, CVData, validateRes.validationToken);
        },
        onSuccess: async (DownloadData) => {
            if(!DownloadData) return;
            const { fileName, downloadFile } = DownloadData;
            const fileBlob = await fetchFile(downloadFile)
            DownloadService.downloadPdf(fileBlob, fileName);
        }, 
        onError: (error) => {
            useErrorStore.getState().createError(error);
        }
    })
}