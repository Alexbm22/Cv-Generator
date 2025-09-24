import React, { useState, useCallback, Dispatch, SetStateAction } from 'react';
import ImageCropper, { CropArea, CropImageOptions } from '../../../../../UI/ImageCropper';
import { getCroppedImage } from '../../../../../../utils/getCroppedImage';

export type CVPhotoCropperProps = {
  imageSrc: string;
  onCroppSuccess: (cropResult: Blob) => Promise<any> | any;
  onCropFail: () => void;
  setIsSelectingPhoto: Dispatch<SetStateAction<boolean>>;
}

const CVPhotoCropper: React.FC<CVPhotoCropperProps> = ({ imageSrc, onCropFail, onCroppSuccess}) => {
  
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCropComplete = useCallback((newCropArea: CropArea) => {
    setCropArea(newCropArea);
    setError(null);
  }, []);

  const processCrop = useCallback(async (
    imageSrc: string,
    options: CropImageOptions = {}
  ) => {
    if (!cropArea) {
      setError('No crop area defined');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const result = await getCroppedImage(imageSrc, cropArea, options);
      onCroppSuccess(result.imgBlob)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown cropping error';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
      onCropFail()
    }
  }, [cropArea]);

  const handleCropImage = async () => {
    if (imageSrc) {
      await processCrop(imageSrc, {
        quality: 0.5,
        format: 'image/jpeg',
        maxWidth: 1080,
        maxHeight: 1080,
      });
    }
  };

  return (
    <div className="max-w-4xl w-full h-full mx-auto">
      <div className="mb-6 w-full h-60">
        <ImageCropper
          imageSrc={imageSrc}
          className='w-full h-full'
          onCropComplete={handleCropComplete}
          aspect={1 / 1}
          cropShape="rect"
          showGrid={true}
        />
      </div>

      {cropArea && (
        <div className='flex gap-x-2'>
          <button
            onClick={handleCropImage}
            disabled={isProcessing}
            className="font-medium text-md p-2 pl-3 pr-3 text-[#007dff] w-fit cursor-pointer bg-[#d7e9ff] 
            hover:bg-[#cce0f9] transition-colors duration-200 rounded-md"
          >
            {isProcessing ? 'Processing...' : 'Crop Image'}
          </button>

          <button
            onClick={onCropFail}
            disabled={isProcessing}
            className="font-medium text-md p-2 pl-3 pr-3 text-[#007dff] w-fit cursor-pointer bg-[#d7e9ff] 
            hover:bg-[#cce0f9] transition-colors duration-200 rounded-md"
          >
            Cancel
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      
    </div>
  );
};

export default CVPhotoCropper