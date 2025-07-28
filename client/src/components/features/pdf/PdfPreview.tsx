import { pdf } from '@react-pdf/renderer';
import { useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { CVAttributes, TemplateComponentProps } from '../../../interfaces/cv';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

type PdfPreviewProps = {
  CVData: CVAttributes;
  PdfDocument: React.FC<TemplateComponentProps>;
  className: string;
};

const PdfPreview = ({ CVData, PdfDocument, className }: PdfPreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const generatePdf = useCallback(async () => {
    // Cancel any ongoing operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this operation
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // Generate PDF blob
      const blob = await pdf(<PdfDocument CV={CVData} />).toBlob();
      
      // Check if operation was cancelled
      if (abortController.signal.aborted) return;

      const blobUrl = URL.createObjectURL(blob);

      try {
        // Load PDF document
        const loadingTask = pdfjsLib.getDocument(blobUrl);
        const pdfDoc = await loadingTask.promise;

        // Check if operation was cancelled
        if (abortController.signal.aborted) {
          URL.revokeObjectURL(blobUrl);
          return;
        }

        // Get first page
        const page = await pdfDoc.getPage(1);
        const viewport = page.getViewport({ scale: 2.5 });

        // Check if operation was cancelled
        if (abortController.signal.aborted) {
          URL.revokeObjectURL(blobUrl);
          return;
        }

        // Create offscreen canvas for rendering
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = viewport.width;
        offscreenCanvas.height = viewport.height;
        const offscreenContext = offscreenCanvas.getContext('2d');
        
        if (!offscreenContext) {
          URL.revokeObjectURL(blobUrl);
          return;
        }

        // Render page to offscreen canvas
        const renderTask = page.render({
          canvasContext: offscreenContext,
          viewport,
        });

        await renderTask.promise;

        // Check if operation was cancelled or component unmounted
        if (abortController.signal.aborted || !canvasRef.current) {
          URL.revokeObjectURL(blobUrl);
          return;
        }

        // Update visible canvas with new content
        const visibleCanvas = canvasRef.current;
        const visibleContext = visibleCanvas.getContext('2d');
        
        if (!visibleContext) {
          URL.revokeObjectURL(blobUrl);
          return;
        }

        visibleCanvas.width = offscreenCanvas.width;
        visibleCanvas.height = offscreenCanvas.height;
        visibleContext.drawImage(offscreenCanvas, 0, 0);

      } finally {
        // Always clean up the blob URL
        URL.revokeObjectURL(blobUrl);
      }

    } catch (error) {
      // Only log errors if operation wasn't cancelled
      if (!abortController.signal.aborted) {
        console.error('Error generating PDF preview:', error);
      }
    }
  }, [CVData, PdfDocument]);

  useEffect(() => {
    generatePdf();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [generatePdf]);

  return <canvas ref={canvasRef} className={className} />;
};

export default PdfPreview;