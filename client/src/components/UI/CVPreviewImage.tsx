import { GuestCVAttributes, UserCVMetadataAttributes } from "../../interfaces/cv";
import { useCVPreviewImage } from "../../hooks/useCVPreviewImage";

type ComponentProps = {
  CV: GuestCVAttributes | UserCVMetadataAttributes;
  FallbackComponent: React.ComponentType;
  className?: string;
  alt?: string;
};

const CVPreviewImage: React.FC<ComponentProps> = ({ CV, FallbackComponent, className, alt }) => {
  return useCVPreviewImage({
    CV,
    FallbackComponent,
    className,
    alt
  });
};

export default CVPreviewImage;
