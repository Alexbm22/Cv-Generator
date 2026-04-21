import { useCallback, useEffect, useState } from "react";
import { CVStateMode, GuestCVAttributes, UserCVAttributes, UserCVMetadataAttributes } from "../interfaces/cv";
import { useCVsStore } from "../Store";
import { useImageWithFallback } from "./useImageWithFallback";
import { useMediaFileQuery } from "./MediaFile/useMediaFileQuery";
import { useMediaFile } from "./MediaFile/useMediaFile";

type UseCVPreviewImageProps = {
  CV: GuestCVAttributes | UserCVMetadataAttributes;
  FallbackComponent: React.ComponentType;
  className?: string;
  alt?: string;
};

export const useCVPreviewImage = ({ 
  CV, 
  FallbackComponent, 
  className = "", 
  alt = "preview image" 
}: UseCVPreviewImageProps) => {
  const CVState = useCVsStore((state) => state.CVState);
  const [cvPreviewSrc, setCvPreviewSrc] = useState<string | null>(null);

  const isUser = CVState.mode === CVStateMode.USER;
  const previewId = (CV as UserCVAttributes)?.previewId;

  const { data: cvPreviewData, refetch } = useMediaFileQuery(previewId!, isUser);
  const { getMediaFileGetUrl } = useMediaFile(cvPreviewData, refetch);

  const fetchCVPreviewSrc = useCallback(async () => {
    if (isUser) {
      setCvPreviewSrc(await getMediaFileGetUrl());
    } else {
      const guestCV = CV as GuestCVAttributes;
      if (guestCV.preview) {
        setCvPreviewSrc(guestCV.preview);
      } else {
        setCvPreviewSrc(null);
      }
    }
  }, [isUser, getMediaFileGetUrl, previewId]);

  useEffect(() => {
    fetchCVPreviewSrc();
  }, [fetchCVPreviewSrc]);

  return useImageWithFallback({
    src: cvPreviewSrc,
    FallbackComponent,
    className,
    alt
  });
};