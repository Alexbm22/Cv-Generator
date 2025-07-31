import React, { useState, useCallback, useMemo } from 'react';
import Cropper from 'react-easy-crop';

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface CropperProps {
  imageSrc: string;
  onCropComplete: (croppedAreaPixels: CropArea) => void;
  aspect?: number;
  className?: string;
  cropShape?: 'rect' | 'round';
  showGrid?: boolean;
  zoomSpeed?: number;
  minZoom?: number;
  maxZoom?: number;
  initialCrop?: Point;
  initialZoom?: number;
}

export interface CropImageOptions {
  quality?: number;
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
  maxWidth?: number;
  maxHeight?: number;
}

export interface CropResult {
  url: string;
}


const ImageCropper: React.FC<CropperProps> = ({
  imageSrc,
  onCropComplete,
  aspect = 4 / 3,
  className = '',
  cropShape = 'rect',
  showGrid = true,
  zoomSpeed = 1,
  minZoom = 1,
  maxZoom = 3,
  initialCrop = { x: 0, y: 0 },
  initialZoom = 1,
}) => {
  const [crop, setCrop] = useState<Point>(initialCrop);
  const [zoom, setZoom] = useState<number>(initialZoom);

  const onCropCompleteInternal = useCallback(
    (croppedArea: CropArea, croppedAreaPixels: CropArea) => {
      onCropComplete(croppedAreaPixels);
    },
    [onCropComplete]
  );

  const cropperClasses = useMemo(
    () => `relative bg-gray-100 rounded-lg overflow-hidden ${className}`,
    [className]
  );

  return (
    <div className={cropperClasses}>
      <Cropper
        image={imageSrc}
        crop={crop}
        zoom={zoom}
        aspect={aspect}
        cropShape={cropShape}
        showGrid={showGrid}
        zoomSpeed={zoomSpeed}
        minZoom={minZoom}
        maxZoom={maxZoom}
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onCropComplete={onCropCompleteInternal}
        style={{
          containerStyle: {
            position: 'relative',
            width: '100%',
            height: '100%',
            backgroundColor: '#f3f4f6',
          },
          mediaStyle: {
            objectFit: 'contain',
          },
        }}
      />
    </div>
  );
};

export default ImageCropper;
