import { useState } from "react";
import { CVStateMode, GuestCVAttributes, UserCVMetadataAttributes } from "../../interfaces/cv";
import { useCVsStore } from "../../Store";

type ComponentProps = {
    CV: GuestCVAttributes | UserCVMetadataAttributes;
    FallbackComponent: React.ComponentType;
}

const CVPreviewImage: React.FC<ComponentProps> = ({CV, FallbackComponent}) => {

    const CVState = useCVsStore(state => state.CVState);

    const [ isCVPreview, setIsCVPreview ] = useState(true)

    const cvPreviewSrc = CVState.mode === CVStateMode.USER ? 
        (CV as UserCVMetadataAttributes).preview?.presigned_get_URL :
        (CV as GuestCVAttributes).preview

    return (
        <>
            {
                isCVPreview && cvPreviewSrc ? (
                    <img 
                        src={cvPreviewSrc} 
                        alt="preview image" 
                        onError={() => {
                            setIsCVPreview(false);
                        }}
                    /> 
                ) : (
                    <FallbackComponent />
                )
            }
        </>
    )
}

export default CVPreviewImage;