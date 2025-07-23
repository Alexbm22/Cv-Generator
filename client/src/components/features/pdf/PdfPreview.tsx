import { pdf } from '@react-pdf/renderer';
import { useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { useCVsStore } from '../../../Store';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

type PdfPreviewProps = {
  PdfDocument: React.FC<any>; // or specify props if you know them
};

const PdfPreview = ({ PdfDocument }: PdfPreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const CVs = useCVsStore(state => state.CVs);

  useEffect(() => {
    const generatePdf = async () => {
      const blob = await pdf(<PdfDocument />).toBlob();
      const blobUrl = URL.createObjectURL(blob);

      const loadingTask = pdfjsLib.getDocument(blobUrl);
      const pdfDoc = await loadingTask.promise;
      const page = await pdfDoc.getPage(1);

      const viewport = page.getViewport({ scale: 1.0 });
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: context,
        viewport,
      }).promise;

      // curățare URL
      URL.revokeObjectURL(blobUrl);
    };
    
    generatePdf();
  }, [CVs]);

  return (
    <canvas ref={canvasRef} />
  );
};

export default PdfPreview;