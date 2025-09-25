import { useEffect, useState } from "react";
import { CVStateMode, GuestCVAttributes, UserCVMetadataAttributes } from "../../interfaces/cv";
import { useCVsStore } from "../../Store";

type ComponentProps = {
  CV: GuestCVAttributes | UserCVMetadataAttributes;
  FallbackComponent: React.ComponentType;
};

const CVPreviewImage: React.FC<ComponentProps> = ({ CV, FallbackComponent }) => {
  const CVState = useCVsStore((state) => state.CVState);

  const [cvPreviewSrc, setCvPreviewSrc] = useState<string | null>(null);

  useEffect(() => {
    if(!CV) return setCvPreviewSrc(null);
    if (CVState.mode === CVStateMode.USER) {
      const userCV = CV as UserCVMetadataAttributes;
      if (userCV.preview?.presigned_get_URL) {
        setCvPreviewSrc(userCV.preview.presigned_get_URL);
      } else {
        setCvPreviewSrc(null);
      }
    } else {
      const guestCV = CV as GuestCVAttributes;
      if (guestCV.preview) {
        setCvPreviewSrc(guestCV.preview);
      } else {
        setCvPreviewSrc(null);
      }
    }
  }, [CV, CVState.mode]);

  if (!cvPreviewSrc || !CV) {
    return <FallbackComponent />;
  }

  return (
    <img
      src={cvPreviewSrc}
      alt="preview image"
      onError={() => setCvPreviewSrc(null)}
    />
  );
};

export default CVPreviewImage;
