import { pdf } from '@react-pdf/renderer';
import { useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { useCVsStore } from '../../../Store';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

type PdfPreviewProps = {
  PdfDocument: React.FC<any>;
  className: string;
};

const PdfPreview = ({ PdfDocument, className }: PdfPreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const CVs = useCVsStore(state => state.CVs);

  useEffect(() => {
    let isMounted = true;

    const generatePdf = async () => {
      let blobUrl: string | null = null;

      try {
        // Generate PDF blob and create URL
        const blob = await pdf(<PdfDocument />).toBlob();
        blobUrl = URL.createObjectURL(blob);

        // Load PDF document
        const loadingTask = pdfjsLib.getDocument(blobUrl);
        const pdfDoc = await loadingTask.promise;
        URL.revokeObjectURL(blobUrl); // Revoke immediately after loading
        blobUrl = null;

        // Get first page
        const page = await pdfDoc.getPage(1);
        const viewport = page.getViewport({ scale: 2.5 });

        // Create offscreen canvas for rendering
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = viewport.width;
        offscreenCanvas.height = viewport.height;
        const offscreenContext = offscreenCanvas.getContext('2d');
        if (!offscreenContext) return;

        // Render page to offscreen canvas
        await page.render({
          canvasContext: offscreenContext,
          viewport,
        }).promise;

        // Check if component is still mounted
        if (!isMounted) return;

        // Update visible canvas with new content
        const visibleCanvas = canvasRef.current;
        if (!visibleCanvas) return;
        
        const visibleContext = visibleCanvas.getContext('2d');
        if (!visibleContext) return;

        visibleCanvas.width = offscreenCanvas.width;
        visibleCanvas.height = offscreenCanvas.height;
        visibleContext.drawImage(offscreenCanvas, 0, 0);
      } catch (error) {
        console.error('Error generating PDF preview:', error);
      } finally {
        // Cleanup blob URL if still exists (e.g., due to error)
        if (blobUrl) URL.revokeObjectURL(blobUrl);
      }
    };

    generatePdf();

    return () => {
      isMounted = false; // Mark component as unmounted
    };
  }, [CVs, PdfDocument]); // Include all necessary dependencies

  return <canvas ref={canvasRef} className={className} />;
};

export default PdfPreview;