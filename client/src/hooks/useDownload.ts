import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useCVsStore, useErrorStore } from "../Store";
import { DownloadService } from "../services/download";
import { generatePdfBlob } from "../services/Pdf";
import { ApiError } from "../interfaces/error";
import { useNavigate } from "react-router-dom";
import { routes } from "../router/routes";
import { DownloadAttributes } from "../interfaces/downloads";
import { fetchFile } from "../services/MediaFiles";
import { UserCVAttributes } from "../interfaces/cv";
import { useCvEditStore } from "../Store/useCvEditStore";
import { useCVPhotoState } from "../components/features/CV/CVEditor/hooks/usePhotoEditor";
import { TemplateMap } from "../constants/CV/TemplatesMap";

export const useDownloadCV = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const getUserCVObject = useCvEditStore(state => state.getUserCVObject);
    const { cvPhotoBlobUrl } = useCVPhotoState();

    return useMutation<DownloadAttributes | void, ApiError, string>({
        mutationFn: async (CVId: string) => {

            const hasDownloadRights = await DownloadService.checkDownloadRights();
            if(!hasDownloadRights) {
                return navigate(routes.prices.path);
            }

            const preparation = await DownloadService.prepareDownload(CVId);
            if (preparation.kind === 'reuse') {
                return preparation.download;
            }
            if (preparation.kind === 'pending') {
                throw new Error('A download for this CV version is already being prepared. Please try again shortly.');
            }

            const CVData = getUserCVObject();
            const TemplateComponent = TemplateMap[CVData.template];
            let failureType: 'pdf_generation' | 's3_upload' | 'completion' | 'unknown' = 'unknown';

            try {
                failureType = 'pdf_generation';
                const pdfBlob = await generatePdfBlob(TemplateComponent, {
                    CV: { ...CVData, photo: cvPhotoBlobUrl }
                });

                failureType = 's3_upload';
                await DownloadService.uploadPreparedPdf(preparation.pdf.putUrl, pdfBlob);

                failureType = 'completion';
                return await DownloadService.completeDownload(preparation.downloadId, preparation.actionId);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                await DownloadService.failDownload(preparation.downloadId, preparation.actionId, failureType, message)
                    .catch(() => undefined);
                throw error;
            }
        },
        onSuccess: async (DownloadData) => {
            if(!DownloadData) return;
            const { fileName, downloadFile } = DownloadData;
            if (!downloadFile.get_URL) {
                throw new Error('The completed PDF does not have a download URL.');
            }
            const fileBlob = await fetchFile(downloadFile.get_URL)
            DownloadService.downloadPdf(fileBlob, fileName);
            await queryClient.invalidateQueries({ queryKey: ['downloads'] });
        }, 
        onError: (error) => {
            console.error("Download error: ", error);
            useErrorStore.getState().createError(error);
        }
    })
}

export const useDuplicateDownload = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const addUserCV = useCVsStore(state => state.addUserCV);

    return useMutation<UserCVAttributes, ApiError, string>({
        mutationFn: async (downloadId: string) => {
            return await DownloadService.duplicateDownload(downloadId);
        },
        onSuccess: (duplicatedCV) => {
            addUserCV(duplicatedCV);
            void queryClient.invalidateQueries({ queryKey: ['downloads'] });
            navigate(
                routes.editResume.path.replace(/:id$/, duplicatedCV.id), 
                { replace: true }
            );
        }
    }) 
}