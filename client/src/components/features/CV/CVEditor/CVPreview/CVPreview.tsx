import React, { useEffect, useRef } from "react";
import { Buffer } from 'buffer';
import { useCVsStore } from "../../../../../Store";
import { generatePdfBlob, renderPdfPreview } from "../../../../../services/Pdf";
import { useCVPhotoState } from "../hooks/usePhotoEditor";
import { useCVPreviewState } from "../hooks/useCVPreviewState";

(window as any).global = window;
(window as any).Buffer = Buffer;

type ComponentProps = {
  isShowingPreview: boolean
}

const CVPreview: React.FC<ComponentProps> = ({ isShowingPreview }) => {
  
  // Get the currently selected CV from the store
  const CVState = useCVsStore(state => state.CVState);
  const selectedCV = CVState.selectedCV

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fetch the photo blob URL for the CV
  const { cvPhotoBlobUrl } = useCVPhotoState();
  
  const { handleCVPreviewUpload } = useCVPreviewState();
  
  // Generate a PDF blob from the CV data and render it to the canvas
  const handleGeneratePdfBlob = async () => {
    if (!selectedCV) return;

    try {
      // Prepare CV data, including the photo
      const cvData = {
        ...selectedCV,
        photo: cvPhotoBlobUrl ?? "/Images/anonymous_Picture.png",
      }

      // Dynamically import the template map and select the template
      const { TemplateMap } = await import("../../../../../constants/CV/TemplatesMap");
      const CVTemplate = TemplateMap[selectedCV.template];

      // Generate the PDF blob using the selected template and CV data
      const pdfBlob = await generatePdfBlob(CVTemplate, { CV: cvData });

      // Render the PDF preview to the canvas
      await renderPdfPreview(pdfBlob, canvasRef.current);

      // Upload the preview image
      await handleCVPreviewUpload(canvasRef.current!);
    } catch (err) {
      console.error("Preview generation failed:", err);
    }
  }

  // Regenerate the preview whenever the selected CV or photo changes
  useEffect(() => {
    handleGeneratePdfBlob();
  }, [selectedCV, cvPhotoBlobUrl])
  
  if(!selectedCV) return <div>There is no CV to preview</div>
  
  return (
    <div className="
    transition-all duration-1000 bg-[#dfebf1]  w-screen h-screen justify-center 
    items-center flex sticky top-0"
      style={isShowingPreview ? {flexBasis: '43.74%'} : {flexBasis: '0%'} }
    >
      <canvas ref={canvasRef} className='aspect-[1/1.4142] max-w-[90%] max-h-[90%]' />
    </div>
  )
}

export default CVPreview;