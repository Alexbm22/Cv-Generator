import { useEffect, useRef, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export function usePdfPreview(pdfBlob: Blob | null) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const generatePdfPreview = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      if (abortController.signal.aborted) return;

      if(!pdfBlob) return canvasRef;
      const blobUrl = URL.createObjectURL(pdfBlob);
      try {
        const loadingTask = pdfjsLib.getDocument(blobUrl);
        const pdfDoc = await loadingTask.promise;
        if (abortController.signal.aborted) return;

        const page = await pdfDoc.getPage(1);
        const viewport = page.getViewport({ scale: 2.5 });

        const offscreenCanvas = document.createElement("canvas");
        offscreenCanvas.width = viewport.width;
        offscreenCanvas.height = viewport.height;
        const offscreenContext = offscreenCanvas.getContext("2d");
        if (!offscreenContext) return;

        const renderTask = page.render({
          canvasContext: offscreenContext,
          viewport,
        });

        await renderTask.promise;
        if (abortController.signal.aborted || !canvasRef.current) return;

        const visibleCanvas = canvasRef.current;
        const visibleContext = visibleCanvas.getContext("2d");
        if (!visibleContext) return;

        visibleCanvas.width = offscreenCanvas.width;
        visibleCanvas.height = offscreenCanvas.height;
        visibleContext.drawImage(offscreenCanvas, 0, 0);
      } finally {
        URL.revokeObjectURL(blobUrl);
      }
    } catch (err) {
      if (!abortControllerRef.current?.signal.aborted) {
        console.error("Error generating PDF preview:", err);
      }
    }
  }, [pdfBlob]);

  useEffect(() => {
    generatePdfPreview();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [generatePdfPreview]);

  return canvasRef;
}
