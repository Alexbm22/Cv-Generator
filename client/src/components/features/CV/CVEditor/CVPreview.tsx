import React, { useEffect, useRef, useState } from "react";
import { Buffer } from 'buffer';
import { useCVsStore } from "../../../../Store";
import { uploadImage } from "../../../../services/MediaFiles";
import { generatePdfBlob, renderPdfPreview } from "../../../../services/Pdf";

(window as any).global = window;
(window as any).Buffer = Buffer;

const CVPreview: React.FC = () => {
  
  const selectedCV = useCVsStore(state => state.selectedCV);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRendered, setIsRendered] = useState(false);
  
  const handleUpload = async () => {
    if (!canvasRef.current || !selectedCV) return;
    
    canvasRef.current.toBlob(async (blob) => {
      if(!blob) return;
      uploadImage(blob, selectedCV.preview?.presigned_put_URL.url!)
    }, "image/png")
  }
  
  const handleGeneratePdfBlob = async () => {
    if (!selectedCV) return;

    setIsRendered(false);

    try {
      console.error('1')
      const { TemplateMap } = await import("../../../../constants/CV/TemplatesMap");
      const CVTemplate = TemplateMap[selectedCV.template];
      const pdfBlob = await generatePdfBlob(CVTemplate, { CV: selectedCV });
      await renderPdfPreview(pdfBlob, canvasRef.current);
      console.error('2')
      setIsRendered(true);

      await handleUpload();
      } catch (err) {
        console.error("Preview generation failed:", err);
        setIsRendered(false);
    }
  }

  useEffect(() => {
    handleGeneratePdfBlob();
  }, [selectedCV])
  
  if(!selectedCV) return <div>There is no CV to preview</div>
  
  return (
    <div className="hidden bg-gray-100 overflow-hidden w-screen max-w-[calc(100vw*0.45)] h-screen justify-center items-center md:flex sticky top-0">
      {
        isRendered ? (
          <canvas ref={canvasRef} className='aspect-[1/1.4142] max-w-[90%] max-h-[90%]' />
        ) : (
          <div className="text-gray-500">{isRendered ? 'true' : 'false' }</div>
        )
      }
    </div>
  )
}

export default CVPreview;