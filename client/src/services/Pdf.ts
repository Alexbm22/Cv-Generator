import { pdf } from "@react-pdf/renderer";
import { createElement, ComponentType } from "react";
import * as pdfjsLib from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export const generatePdfBlob = async <T extends object>(
  PdfDocument: ComponentType<T>,
  documentProps: T
) => {
  try {
    const blob = await pdf(createElement(PdfDocument, documentProps)).toBlob();

    const maxSizeInBytes = 10 * 1024 * 1024;
    if (blob.size > maxSizeInBytes) {
      throw new Error(`PDF too large: ${(blob.size / 1024 / 1024).toFixed(2)}MB (max: 10MB)`);
    }

    return blob;
  } catch (error) {
    const errorMessage =
      typeof error === "object" && error !== null && "message" in error
        ? (error as { message: string }).message
        : String(error);
    throw new Error(`Failed to generate PDF: ${errorMessage}`);
  }
};

export const pdfBlobToCanvas = async (pdfBlob: Blob) => {
  const blobUrl = URL.createObjectURL(pdfBlob);
  try {
    const loadingTask = pdfjsLib.getDocument(blobUrl);
    const pdfDoc = await loadingTask.promise;
  
    const page = await pdfDoc.getPage(1);
    const viewport = page.getViewport({ scale: 2.5 });
  
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const canvasContext = canvas.getContext("2d");
  
    if(!canvasContext) return;
  
    const renderTask = page.render({
      canvasContext,
      viewport,
    });
  
    await renderTask.promise;
    
    return canvas;
  } finally {
    URL.revokeObjectURL(blobUrl);
  }

}

export const renderPdfPreview = async (blob: Blob, canvas: HTMLCanvasElement | null): Promise<void> => {
  const blobUrl = URL.createObjectURL(blob);

  try {
    const loadingTask = pdfjsLib.getDocument(blobUrl);
    const pdfDoc = await loadingTask.promise;

    const page = await pdfDoc.getPage(1);
    const viewport = page.getViewport({ scale: 2.5 });

    // Render to offscreen canvas first
    const offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = viewport.width;
    offscreenCanvas.height = viewport.height;
    const offscreenContext = offscreenCanvas.getContext("2d");
    if (!offscreenContext) throw new Error("Could not get 2D context");

    await page.render({
      canvasContext: offscreenContext,
      viewport,
    }).promise;

    if (!canvas) return;

    // Copy to the visible canvas
    canvas.width = offscreenCanvas.width;
    canvas.height = offscreenCanvas.height;
    const visibleContext = canvas.getContext("2d");
    if (!visibleContext) throw new Error("Could not get 2D context for visible canvas");

    visibleContext.drawImage(offscreenCanvas, 0, 0);
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}