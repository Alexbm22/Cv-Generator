import { StoreApi } from "zustand";
import { CVEditStore, CVStateMode, TemplateComponentProps, TemplateCV, UserCVAttributes, UserCVMetadataAttributes } from "../interfaces/cv";
import { useCVsStore } from "../Store";
import { CVServerService } from "./CVServer";
import { debounce } from "lodash";
import { getDefaultPhotoPath } from "../utils/cvDefaults";
import { generatePdfBlob, pdfBlobToCanvas } from "./Pdf";
import { getMediaFileById, uploadImage } from "./MediaFiles";

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
    cvData: TemplateCV,
    CVTemplate: React.FC<TemplateComponentProps>
): Promise<void> => {
    const CVData = {
        ...cvData, 
        photo: getDefaultPhotoPath()
    }

    const cvBlob = await generatePdfBlob(CVTemplate, { CV: CVData });
    const CVCanvas = await pdfBlobToCanvas(cvBlob);

    if (CVCanvas) {
        const cvPreviewData = await getMediaFileById(cvData.previewId!);
        CVCanvas.toBlob(async (blob) => {
            if(!blob) return;
            uploadImage(blob, cvPreviewData)
        }, "image/png")
    }
};

export const syncCVs = async (createdCVs: UserCVAttributes[]) => {
    const migrateGuestToUser = useCVsStore.getState().migrateGuestToUser;
    
    const cvsPromise = createdCVs.map(async (createdCV) => {
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

        const { TemplateMap } = await import("../constants/CV/TemplatesMap");
        const CVTemplate = TemplateMap[createdCV.template];

        await generateAndUploadCVPreview(createdCV, CVTemplate);
        
        return CVMetaData;
    }) 

    const cvs = await Promise.all(cvsPromise);
    migrateGuestToUser(cvs);
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
