import { CVStateMode, GuestCVAttributes, UserCVAttributes } from "../../../../../interfaces/cv";
import { uploadImage } from "../../../../../services/MediaFiles";
import { useCvEditStore, useCVsStore } from "../../../../../Store";


export const useCVPreviewState = () => {

    const CVState = useCVsStore(state => state.CVState);
    const setGuestPreview = useCvEditStore(state => state.setGuestPreview)

    const handleUserCVPreviewUpload = async (canvas: HTMLCanvasElement, selectedCV: UserCVAttributes) => {
        if (!canvas || !selectedCV) return;
        
        canvas.toBlob(async (blob) => {
            if(!blob) return;
            await uploadImage(blob, selectedCV.preview!)
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