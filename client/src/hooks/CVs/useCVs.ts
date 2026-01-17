import { useMutation } from "@tanstack/react-query"
import { useCvEditStore, useCVsStore } from "../../Store";
import { UserCVAttributes, CVStateMode, GuestCVAttributes, UserCVMetadataAttributes } from "../../interfaces/cv";
import { ApiError } from "../../interfaces/error";
import { CVServerService } from "../../services/CVServer";
import { generatePdfBlob, pdfBlobToCanvas } from "../../services/Pdf";
import { uploadImage } from "../../services/MediaFiles";
import { useNavigate } from "react-router-dom";
import { routes } from "../../router/routes";
import { createDefaultCVObject } from "../../utils/cv";
import { uploadDefaultPhoto, getDefaultPhotoPath } from "../../utils/cvDefaults";

export const useCreateUserCV = () => {
    const addUserCV = useCVsStore(state => state.addUserCV);
    const CVState = useCVsStore(state => state.CVState);
    const navigate = useNavigate();

    return useMutation<UserCVAttributes, ApiError>({
        mutationFn: async () => { 
            if(CVState.mode === CVStateMode.USER) {
                return await CVServerService.createNewCV();
            } else {
                throw new Error("CV creation is only supported in USER mode.");
            }

        },
        onSuccess: async (createdCV) => {
            
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
            
            addUserCV(CVMetaData);
            
            navigate(
                routes.editResume.path.replace(/:id$/, createdCV.id), 
            );
            
            const { TemplateMap } = await import("../../constants/CV/TemplatesMap");
            const CVTemplate = TemplateMap[createdCV.template];

            const CVData = {
                ...createdCV, 
                photo: getDefaultPhotoPath()
            }

            const cvBlob = await generatePdfBlob(CVTemplate, { CV: CVData });
            const CVCanvas = await pdfBlobToCanvas(cvBlob);

            if (CVCanvas) {
                CVCanvas.toBlob(async (blob) => {
                    if(!blob) return;
                    uploadImage(blob, createdCV.preview!)
                }, "image/png")
            }               

            uploadDefaultPhoto(createdCV.photo!);
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

export const useInitialCVsSync = () => {

    const migrateGuestToUser = useCVsStore(state => state.migrateGuestToUser);
    const CVState = useCVsStore(state => state.CVState);

    return useMutation<UserCVAttributes[], ApiError>({
        mutationFn: async () => { 
            if(CVState.mode === CVStateMode.GUEST) {
                const sanitizedCVs = CVState.cvs.map((cv) => {
                    const { photo, preview, ...rest } = cv; // scoatem câmpurile mari
                    return rest;
                });
                return await CVServerService.createCVs(sanitizedCVs);
            } else {
                throw new Error("Initial data sync is only supported for guest mode.");
            }
        },
        onSuccess: async (createdCVs) => {
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
    
                const { TemplateMap } = await import("../../constants/CV/TemplatesMap");
                const CVTemplate = TemplateMap[createdCV.template];
    
                const CVData = {
                    ...createdCV, 
                    photo: getDefaultPhotoPath()
                }
    
                const cvBlob = await generatePdfBlob(CVTemplate, { CV: CVData });
                const CVCanvas = await pdfBlobToCanvas(cvBlob);
    
                if (CVCanvas) {
                    CVCanvas.toBlob(async (blob) => {
                        if(!blob) return;
                        uploadImage(blob, createdCV.preview!)
                    }, "image/png")
                }      
                
                return CVMetaData;
            }) 

            const cvs = await Promise.all(cvsPromise);
            migrateGuestToUser(cvs);
        },
        onError: (error) => {
            console.error("Error during initial CVs sync:", error);
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

