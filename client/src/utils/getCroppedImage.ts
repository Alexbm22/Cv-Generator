import { CropArea, CropImageOptions, CropResult } from "../components/UI/ImageCropper";

export const getCroppedImage = async (
  imageSrc: string,
  cropArea: CropArea,
  options: CropImageOptions = {}
): Promise<CropResult> => {
  const {
    quality = 0.92,
    format = 'image/jpeg',
    maxWidth,
    maxHeight,
  } = options;

  return new Promise((resolve, reject) => {
    const image = new Image();
    
    // Critical: Handle CORS for cross-origin images
    image.crossOrigin = 'anonymous';

    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas 2D context'));
          return;
        }

        // Calculate optimal canvas dimensions
        let { width: cropWidth, height: cropHeight } = cropArea;

        // Apply max dimension constraints if specified
        if (maxWidth && cropWidth > maxWidth) {
          const ratio = maxWidth / cropWidth;
          cropWidth = maxWidth;
          cropHeight = cropHeight * ratio;
        }

        if (maxHeight && cropHeight > maxHeight) {
          const ratio = maxHeight / cropHeight;
          cropHeight = maxHeight;
          cropWidth = cropWidth * ratio;
        }

        canvas.width = cropWidth;
        canvas.height = cropHeight;

        // Enterprise-grade: Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Perform the crop operation
        ctx.drawImage(
          image,
          cropArea.x,
          cropArea.y,
          cropArea.width,
          cropArea.height,
          0,
          0,
          cropWidth,
          cropHeight
        );

        // Convert to base64-encoded data URL string
        const url =  canvas.toDataURL(format, quality);
        resolve({url});
      } catch (error) {
        reject(new Error(`Cropping operation failed: ${error}`));
      }
    };

    image.onerror = () => {
      reject(new Error('Failed to load image. Check image source and CORS policy.'));
    };

    image.src = imageSrc;
  });
};