import React, { useState, useCallback, Dispatch, SetStateAction } from 'react';
import ImageCropper, { CropArea, CropImageOptions } from '../../../../UI/ImageCropper';
import { getCroppedImage } from '../../../../../utils/getCroppedImage';
import { useCvEditStore } from '../../../../../Store';

export type CVPhotoCropperProps = {
  imageSrc: string;
  setImageSource: Dispatch<SetStateAction<string | null>>;
  setIsSelectingPhoto: Dispatch<SetStateAction<boolean>>;
}

const CVPhotoCropper: React.FC<CVPhotoCropperProps> = ({ imageSrc, setIsSelectingPhoto }) => {
  
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setPhoto = useCvEditStore(state => state.setPhoto);

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
      setPhoto(result.url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown cropping error';
      setError(errorMessage);
      setPhoto(null);
    } finally {
      setIsProcessing(false);
      setIsSelectingPhoto(false);
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
    <div className="max-w-4xl w-full h-40 mx-auto p-6">
      <div className="mb-6 w-full h-full">
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
        <div className="mb-6">
          <button
            onClick={handleCropImage}
            disabled={isProcessing}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Crop Image'}
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