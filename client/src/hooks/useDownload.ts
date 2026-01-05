import { useMutation } from "@tanstack/react-query"
import { useCVsStore, useErrorStore } from "../Store";
import { DownloadService } from "../services/download";
import { TemplateMap } from "../constants/CV/TemplatesMap";
import { generatePdfBlob } from "../services/Pdf";
import { ApiError } from "../interfaces/error";
import { CVServerService } from "../services/CVServer";
import { useNavigate } from "react-router-dom";
import { routes } from "../router/routes";
import { DownloadAttributes } from "../interfaces/downloads";
import { fetchFile } from "../services/MediaFiles";
import { UserCVAttributes } from "../interfaces/cv";

export const useDownloadCV = () => {
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
                return navigate(routes.prices.path);
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
            console.error("Download error: ", error);
            useErrorStore.getState().createError(error);
        }
    })
}

export const useDuplicateDownload = () => {
    const navigate = useNavigate();
    const addUserCV = useCVsStore(state => state.addUserCV);

    return useMutation<UserCVAttributes, ApiError, string>({
        mutationFn: async (downloadId: string) => {
            return await DownloadService.duplicateDownload(downloadId);
        },
        onSuccess: (duplicatedCV) => {
            addUserCV(duplicatedCV);
            navigate(
                routes.editResume.path.replace(/:id$/, duplicatedCV.id), 
                { replace: true }
            );
        }
    }) 
}