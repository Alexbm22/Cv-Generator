import { pdf } from "@react-pdf/renderer";
import { createElement, ComponentType } from "react";

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