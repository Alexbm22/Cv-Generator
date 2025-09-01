import { useMutation } from "@tanstack/react-query"
import { useAuthStore, useCVsStore } from "../../Store";
import { CVAttributes, CVMetadataAttributes } from "../../interfaces/cv";
import { ApiError } from "../../interfaces/error";
import { CVServerService } from "../../services/CVServer";
import { generatePdfBlob, pdfBlobToCanvas } from "../../services/Pdf";
import { uploadImage } from "../../services/MediaFiles";
import { useNavigate } from "react-router-dom";
import { routes } from "../../router/routes";

export const useCreateCV = () => {
    //  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    
    const addCV = useCVsStore(state => state.addCV);
    const navigate = useNavigate();

    return useMutation<CVAttributes, ApiError>({
        mutationFn: async () => { // To adjust this for not authenticated users
            return (await CVServerService.createNewCV()); // just for test
        },
        onSuccess: async (createdCV) => {
            navigate(
                routes.editResume.path.replace(/:id$/, createdCV.id ?? "" ), 
                { replace: true }
            )
            
            const CVMetaData: CVMetadataAttributes = {
                id: createdCV.id,
                jobTitle: createdCV.jobTitle,
                title:createdCV.title,
                template: createdCV.template,
                photo: createdCV.photo,
                preview: createdCV.preview,
                updatedAt: createdCV.updatedAt,
                createdAt: createdCV.createdAt
            }

            addCV(CVMetaData);

            const { TemplateMap } = await import("../../constants/CV/TemplatesMap");
            const CVTemplate = TemplateMap[createdCV.template];

            const cvBlob = await generatePdfBlob(CVTemplate, { CV: createdCV });
            const CVCanvas = await pdfBlobToCanvas(cvBlob);

            if (CVCanvas) {
                CVCanvas.toBlob(async (blob) => {
                    if(!blob) return;
                    uploadImage(blob, createdCV.preview?.presigned_put_URL.url!)
                }, "image/png")
            }                
        }
    })
}

export const useDeleteCV = (CVId: string) => {
    const removeCV = useCVsStore(state => state.removeCV);
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);

    return useMutation<null, ApiError>({
        mutationFn: async () => {
            return isAuthenticated ? (await CVServerService.deleteCV(CVId)) : null;
        },
        onSuccess: () => {
            removeCV(CVId);
        }
    })
}

