import { useMutation } from "@tanstack/react-query"
import { useCvEditStore, useCVsStore } from "../../Store";
import { UserCVAttributes, CVStateMode, GuestCVAttributes, UserCVMetadataAttributes, TemplateCV } from "../../interfaces/cv";
import { ApiError } from "../../interfaces/error";
import { CVServerService } from "../../services/CVServer";
import { generatePdfBlob, pdfBlobToCanvas } from "../../services/Pdf";
import { useNavigate } from "react-router-dom";
import { routes } from "../../router/routes";
import { createDefaultCVObject } from "../../utils/cv";
import { getDefaultPhotoPath } from "../../utils/cvDefaults";
import { generateAndUploadCVPreview } from "../../services/CVLocal";
import { useMediaFile } from "../MediaFile/useMediaFile";
import { useMediaFileQuery } from "../MediaFile/useMediaFileQuery";
import { useState } from "react";

export const useCreateUserCV = () => {
    const addUserCV = useCVsStore(state => state.addUserCV);
    const CVState = useCVsStore(state => state.CVState);
    const navigate = useNavigate();

    const [ photoId, setPhotoId ] = useState<string | null>(null);

    const { data: cvPreviewData, refetch } = useMediaFileQuery(photoId!, CVState.mode === CVStateMode.USER);
    const { getMediaFileGetUrl } = useMediaFile(cvPreviewData, refetch);

    return useMutation<UserCVAttributes, ApiError>({
        mutationFn: async () => { 
            if(CVState.mode === CVStateMode.USER) {
                return await CVServerService.createNewCV();
            } else {
                throw new Error("CV creation is only supported in USER mode.");
            }

        },
        onSuccess: async (createdCV) => {
            setPhotoId(createdCV.photoId);
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
            
            addUserCV(CVMetaData);
            
            navigate(
                routes.editResume.path.replace(/:id$/, createdCV.id), 
            );
            
            const { TemplateMap } = await import("../../constants/CV/TemplatesMap");
            const CVTemplate = TemplateMap[createdCV.template];

            const photoUrl = await getMediaFileGetUrl();

            const CVData: TemplateCV = {
                ...createdCV, 
                photo: photoUrl ?? getDefaultPhotoPath()
            }
            
            generateAndUploadCVPreview(CVData, CVTemplate)
        }
    })
}

export const useCreateGuestCV = () => {
    
    const addGuestCV = useCVsStore(state => state.addGuestCV);
    const CVState = useCVsStore(state => state.CVState);

    const setGuestPreview = useCvEditStore(state => state.setGuestPreview);
    const setGuestCV = useCvEditStore(state => state.setGuestCV);

    const navigate = useNavigate();

    return useMutation<GuestCVAttributes, ApiError>({
        mutationFn: async () => { 
            if(CVState.mode === CVStateMode.GUEST) {
                const now = new Date();
                const defaultCV = createDefaultCVObject();
                return Promise.resolve({
                    ...defaultCV,
                    updatedAt: now,
                    createdAt: now
                } as GuestCVAttributes);
            } else {
                throw new Error("CV creation is only supported in Guest mode.");
            }

        },
        onSuccess: async (createdCV) => {
            
            addGuestCV(createdCV);
            
            navigate(
                routes.editResume.path.replace(/:id$/, createdCV.id ?? "" ), 
            ) 
            
            const { TemplateMap } = await import("../../constants/CV/TemplatesMap");
            const CVTemplate = TemplateMap[createdCV.template];

            const CVData = {
                ...createdCV, 
                photo: getDefaultPhotoPath()
            }

            const cvBlob = await generatePdfBlob(CVTemplate, { CV: CVData });
            const CVCanvas = await pdfBlobToCanvas(cvBlob);

            if (CVCanvas) {
                setGuestCV(createdCV);
                setGuestPreview(CVCanvas.toDataURL());
            }                
        }
    })
}

export const useDeleteCV = (CVId: string) => {
    const removeCV = useCVsStore(state => state.removeCV);
    const CVState = useCVsStore(state => state.CVState);

    return useMutation<void, ApiError>({
        mutationFn: async () => {
            if(CVState.mode === CVStateMode.USER) {
                await CVServerService.deleteCV(CVId)
            } 
        },
        onSuccess: () => {
            removeCV(CVId);
        }
    })
}

