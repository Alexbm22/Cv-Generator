import { CVStateMode, GuestCVAttributes, UserCVAttributes } from "../../../../../interfaces/cv";
import { useCvEditStore, useCVsStore } from "../../../../../Store";
import { useMediaFileQuery } from "../../../../../hooks/MediaFile/useMediaFileQuery";
import { useMediaFile } from "../../../../../hooks/MediaFile/useMediaFile";


export const useCVPreviewState = () => {

    const CVState = useCVsStore(state => state.CVState);
    const setGuestPreview = useCvEditStore(state => state.setGuestPreview)
    const previewId = (CVState.selectedCV as UserCVAttributes)?.previewId;
    const isUser = CVState.mode === CVStateMode.USER;

    const { data: cvPreviewData, refetch } = useMediaFileQuery(previewId!, isUser);
    const { uploadMediaFile } = useMediaFile(cvPreviewData, refetch);

    const handleUserCVPreviewUpload = async (canvas: HTMLCanvasElement, selectedCV: UserCVAttributes) => {
        if (!canvas || !selectedCV) return;
        
        canvas.toBlob(async (blob) => {
            if(!blob) return;
            await uploadMediaFile(blob);
        }, "image/png")
    }

    const handleGuestCVPreviewUpload = async (canvas: HTMLCanvasElement, selectedCV: GuestCVAttributes) => {
        if (!canvas || !selectedCV) return;
        
        setGuestPreview(canvas.toDataURL());
    }

    const handleCVPreviewUpload = async (canvas: HTMLCanvasElement) => {

        if(!CVState.selectedCV) return;

        if(CVState.mode === CVStateMode.USER) {
            return await handleUserCVPreviewUpload(canvas, CVState.selectedCV)
        } else {
            return await handleGuestCVPreviewUpload(canvas, CVState.selectedCV)
        }
    }

    return {
        handleCVPreviewUpload
    }

}