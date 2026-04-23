import React, { useEffect, useRef, useState } from "react";
import { Buffer } from 'buffer';
import { useCVsStore } from "../../../Store";
import { generatePdfBlob, renderPdfPreview } from "../../../services/Pdf";
import { useCVPhotoState } from "./CVEditor/hooks/usePhotoEditor";
import { useCVPreviewState } from "./CVEditor/hooks/useCVPreviewState";
import { LoadingSpinner } from "../../UI/LoadingSpinner";

(window as any).global = window;
(window as any).Buffer = Buffer;

// Cache the dynamic import so the template map is only loaded once
let templateMapCache: Awaited<typeof import("../../../constants/CV/TemplatesMap")> | null = null;
const getTemplateMap = async () => {
  if (!templateMapCache) {
    templateMapCache = await import("../../../constants/CV/TemplatesMap");
  }
  return templateMapCache;
};

const DEBOUNCE_MS = 600;

type ComponentProps = {
  isShowingPreview: boolean;
}

const CVPreview: React.FC<ComponentProps> = ({ isShowingPreview }) => {

  const CVState = useCVsStore(state => state.CVState);
  const selectedCV = CVState.selectedCV;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  const { cvPhotoBlobUrl, isLoadingPhotoUrl } = useCVPhotoState();
  const { handleCVPreviewUpload } = useCVPreviewState();

  // Keep a stable ref so the effect never retriggers due to function identity changes
  const uploadRef = useRef(handleCVPreviewUpload);
  useEffect(() => { uploadRef.current = handleCVPreviewUpload; });

  useEffect(() => {
    if (!selectedCV || isLoadingPhotoUrl) return;

    // Each effect run gets its own cancellation token
    const cancelled = { current: false };

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setIsRendering(true);
      try {
        const cvData = {
          ...selectedCV,
          photo: cvPhotoBlobUrl ?? "/Images/anonymous_Picture.png",
        };

        const { TemplateMap } = await getTemplateMap();
        if (cancelled.current) return;

        const CVTemplate = TemplateMap["polaris"];
        const pdfBlob = await generatePdfBlob(CVTemplate, { CV: cvData });
        if (cancelled.current) return;

        await renderPdfPreview(pdfBlob, canvasRef.current);
        if (cancelled.current) return;

        await uploadRef.current(canvasRef.current!);
      } catch (err) {
        console.error("Preview generation failed:", err);
      } finally {
        if (!cancelled.current) setIsRendering(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled.current = true;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [selectedCV, cvPhotoBlobUrl, isLoadingPhotoUrl]);

  if (!selectedCV) return <div>There is no CV to preview</div>;

  return (
    <div
      className="transition-all duration-1000 bg-[#dfebf1] justify-center items-center flex fixed top-15 bottom-0 right-0 z-40 max-h-screen"
      style={isShowingPreview ? { width: '43.74%' } : { width: '0%' }}
    >
      <canvas ref={canvasRef} className="aspect-[1/1.4142] max-w-[85%] max-h-[85%]" />
      {isRendering && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      )}
    </div>
  );
}

export default CVPreview;