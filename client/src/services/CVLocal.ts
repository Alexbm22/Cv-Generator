import { StoreApi } from "zustand";
import { CVEditStore, CVStateMode, TemplateComponentProps, UserCVAttributes, UserCVMetadataAttributes } from "../interfaces/cv";
import { useCVsStore } from "../Store";
import { CVServerService } from "./CVServer";
import { debounce } from "lodash";
import { generatePdfBlob, pdfBlobToCanvas } from "./Pdf";
import { getMediaFileUrl, uploadImage, markMediaFileActiveStatus } from "./MediaFiles";
import { getImageBlob } from "../utils/blob";
import { MediaFilesAttributes } from "../interfaces/mediaFiles";
import { queryClient } from "../queryClient";

export const autoSaveCV = () => {
    return debounce(async (api: StoreApi<CVEditStore>) => {

        const { getUserCVObject, getGuestCVObject } = api.getState();
        const { 
            CVState, 
            setUserSelectedCV, 
            setGuestSelectedCV,
            updateGuestCV
        } = useCVsStore.getState();
        
        if(CVState.mode === CVStateMode.USER) {
            const updatedCV = getUserCVObject();

            const selectedCV = CVState.selectedCV;
            // verify if there are changes
            if(JSON.stringify(selectedCV) === JSON.stringify(updatedCV)) return; 

            await CVServerService.sync(updatedCV);
            setUserSelectedCV(updatedCV);
        } else {
            const updatedCV = getGuestCVObject();

            const selectedCV = CVState.selectedCV;
            // verify if there are changes
            if(JSON.stringify(selectedCV) === JSON.stringify(updatedCV)) return;

            updateGuestCV(updatedCV);
            setGuestSelectedCV(updatedCV);
        }
    }, 3000);
}

export const generateAndUploadCVPreview = async (
    cvData: UserCVAttributes,
    CVTemplate: React.FC<TemplateComponentProps>
): Promise<void> => {
    const cvBlob = await generatePdfBlob(CVTemplate, { CV: cvData });
    const CVCanvas = await pdfBlobToCanvas(cvBlob);

    if (CVCanvas) {
        CVCanvas.toBlob(async (blob) => {
            if(!blob) return;
            const putUrl = await getMediaFileUrl(cvData.previewId, 'put');
            if(putUrl) {
                await uploadImage(putUrl, blob);
            }

            const blobUrl = URL.createObjectURL(blob);
            queryClient.setQueryData<MediaFilesAttributes>(
                ['mediaFile', cvData.previewId],
                (prev) => prev ? { ...prev, is_active: true, get_URL: blobUrl, expiresAt: Date.now() + 10 * 60 * 1000 } : prev
            );
        }, "image/png")
    }
};

const uploadGuestMediaFile = async (mediaId: string, base64Photo: string): Promise<void> => {
    const blob = await getImageBlob(base64Photo);
    const putUrl = await getMediaFileUrl(mediaId, 'put');
    if (!putUrl) return;

    await uploadImage(putUrl, blob);
    await markMediaFileActiveStatus(mediaId, true);

    const blobUrl = URL.createObjectURL(blob);
    queryClient.setQueryData<MediaFilesAttributes>(
        ['mediaFile', mediaId],
        (prev) => prev ? { ...prev, is_active: true, get_URL: blobUrl, expiresAt: Date.now() + 10 * 60 * 1000 } : prev
    );
};

export const syncCVs = async (createdCVs: UserCVAttributes[]) => {
    const { migrateGuestToUser, CVState } = useCVsStore.getState();
    const guestCVs = CVState.mode === CVStateMode.GUEST ? CVState.cvs : [];

    try {
        const cvsPromise = createdCVs.map(async (createdCV, index) => {
            const CVMetaData: UserCVMetadataAttributes = {
                id: createdCV.id,
                jobTitle: createdCV.jobTitle,
                title:createdCV.title,
                template: createdCV.template,
                photoId: createdCV.photoId,
                previewId: createdCV.previewId,
                updatedAt: createdCV.updatedAt,
                createdAt: createdCV.createdAt
            }

            const guestCV = guestCVs[index];

            if (guestCV?.photo) {
                await uploadGuestMediaFile(createdCV.photoId, guestCV.photo);
            }
            if (guestCV?.preview) {
                await uploadGuestMediaFile(createdCV.previewId, guestCV.preview);
            }
            
            return CVMetaData;
        }) 
    
        const cvs = await Promise.all(cvsPromise);
        migrateGuestToUser(cvs);
    } catch (err) {
        console.error("Error syncing CVs:", err);
        migrateGuestToUser();
    }
    
}

export const getGuestCVs = () => {
    const { CVState } = useCVsStore.getState();

    if(CVState.mode === CVStateMode.GUEST) {
        return CVState.cvs.map((cv) => {
            const { photo, preview, ...rest } = cv;
            return rest;
        });
    }

    return [];
}
