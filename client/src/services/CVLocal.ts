import { StoreApi } from "zustand";
import { CVEditStore, CVStateMode, TemplateComponentProps, UserCVAttributes, UserCVMetadataAttributes } from "../interfaces/cv";
import { useCVsStore } from "../Store";
import { CVServerService } from "./CVServer";
import { debounce } from "lodash";
import { getDefaultPhotoPath } from "../utils/cvDefaults";
import { generatePdfBlob, pdfBlobToCanvas } from "./Pdf";
import { uploadImage } from "./MediaFiles";

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
    }, 4000);
}

export const generateAndUploadCVPreview = async (
    cvData: UserCVAttributes,
    CVTemplate: React.FC<TemplateComponentProps>
): Promise<void> => {
    const CVData = {
        ...cvData, 
        photo: getDefaultPhotoPath()
    }

    const cvBlob = await generatePdfBlob(CVTemplate, { CV: CVData });
    const CVCanvas = await pdfBlobToCanvas(cvBlob);

    if (CVCanvas) {
        CVCanvas.toBlob(async (blob) => {
            if(!blob) return;
            uploadImage(blob, cvData.preview!)
        }, "image/png")
    }
};

export const syncCVs = async (createdCVs: UserCVAttributes[]) => {
    const migrateGuestToUser = useCVsStore(state => state.migrateGuestToUser);
    
    const cvsPromise = createdCVs.map(async (createdCV) => {
        const CVMetaData: UserCVMetadataAttributes = {
            id: createdCV.id,
            jobTitle: createdCV.jobTitle,
            title:createdCV.title,
            template: createdCV.template,
            photo: createdCV.photo,
            preview: createdCV.preview,
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
            const { photo, preview, ...rest } = cv; // scoatem câmpurile mari
            return rest;
        });
    }

    return [];
}
