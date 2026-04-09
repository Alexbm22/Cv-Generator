import React, { useRef, useCallback, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import ImageCropper, { CropArea, CropImageOptions } from './ImageCropper';
import { getCroppedImage } from '../../utils/getCroppedImage';
import type { DialogStep } from '../../hooks/useProfilePhotoEditor';
import { LoadingSpinner } from './LoadingSpinner';

interface ProfilePhotoDialogProps {
  isOpen: boolean;
  currentStep: DialogStep;
  selectedImage: string | null;
  isProcessing: boolean;
  error: string | null;
  onClose: () => void;
  onImageSelect: (image: string) => void;
  onStepChange: (step: DialogStep) => void;
  onSave: (imageBlob: Blob) => Promise<void>;
}

const ACCEPTED_FILE_TYPES = 'image/jpeg,image/png,image/webp,image/gif';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ProfilePhotoDialog: React.FC<ProfilePhotoDialogProps> = ({
  isOpen,
  currentStep,
  selectedImage,
  isProcessing,
  error,
  onClose,
  onImageSelect,
  onStepChange,
  onSave,
}) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-0 shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          aria-describedby={undefined}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              {currentStep === 'select' && 'Choose Photo'}
              {currentStep === 'crop' && 'Adjust Photo'}
              {currentStep === 'saving' && 'Saving...'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="rounded-full cursor-pointer p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {currentStep === 'select' && (
              <ImageSelectStep
                onImageSelect={(image) => {
                  onImageSelect(image);
                  onStepChange('crop');
                }}
                onCancel={onClose}
              />
            )}

            {currentStep === 'crop' && selectedImage && (
              <ImageCropStep
                imageSrc={selectedImage}
                isProcessing={isProcessing}
                onCropComplete={onSave}
                onBack={() => {
                  onImageSelect('');
                  onStepChange('select');
                }}
                onCancel={onClose}
              />
            )}

            {currentStep === 'saving' && (
              <SavingStep />
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

// Step 1: Image Selection
interface ImageSelectStepProps {
  onImageSelect: (image: string) => void;
  onCancel: () => void;
}

const ImageSelectStep: React.FC<ImageSelectStepProps> = ({ onImageSelect, onCancel }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    if (!file.type.startsWith('image/')) {
      setFileError('Please select an image file');
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError('Image must be smaller than 10MB');
      return false;
    }
    setFileError(null);
    return true;
  };

  const readFile = useCallback((file: File) => {
    if (!validateFile(file)) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (result) {
        onImageSelect(result);
      }
    };
    reader.onerror = () => {
      setFileError('Failed to read file');
    };
    reader.readAsDataURL(file);
  }, [onImageSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      readFile(file);
    }
  }, [readFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      readFile(file);
    }
  }, [readFile]);

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative flex flex-col items-center justify-center
          rounded-xl border-2 border-dashed p-10
          transition-all duration-200 cursor-pointer
          ${isDragging 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
          }
        `}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        aria-label="Upload image"
      >
        <div className={`
          rounded-full p-4 mb-4 transition-colors
          ${isDragging ? 'bg-blue-100' : 'bg-gray-100'}
        `}>
          {isDragging ? (
            <Upload className="h-8 w-8 text-blue-500" />
          ) : (
            <ImageIcon className="h-8 w-8 text-gray-400" />
          )}
        </div>
        
        <p className="text-sm font-medium text-gray-700 mb-1">
          {isDragging ? 'Drop image here' : 'Drag and drop your photo'}
        </p>
        <p className="text-xs text-gray-500">
          or click to browse
        </p>
        <p className="text-xs text-gray-400 mt-2">
          JPG, PNG, WebP or GIF up to 10MB
        </p>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_FILE_TYPES}
          onChange={handleFileSelect}
          className="hidden"
          aria-hidden="true"
        />
      </div>

      {fileError && (
        <p className="text-sm text-red-600 text-center">{fileError}</p>
      )}

      {/* Actions */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// Step 2: Image Cropping
interface ImageCropStepProps {
  imageSrc: string;
  isProcessing: boolean;
  onCropComplete: (blob: Blob) => Promise<void>;
  onBack: () => void;
  onCancel: () => void;
}

const ImageCropStep: React.FC<ImageCropStepProps> = ({
  imageSrc,
  isProcessing,
  onCropComplete,
  onBack,
  onCancel,
}) => {
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const [cropError, setCropError] = useState<string | null>(null);

  const handleCropAreaChange = useCallback((area: CropArea) => {
    setCropArea(area);
    setCropError(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!cropArea) {
      setCropError('Please adjust the crop area');
      return;
    }

    try {
      const cropOptions: CropImageOptions = {
        quality: 0.9,
        format: 'image/jpeg',
        maxWidth: 512,
        maxHeight: 512,
      };

      const result = await getCroppedImage(imageSrc, cropArea, cropOptions);
      await onCropComplete(result.imgBlob);
    } catch (err) {
      setCropError(err instanceof Error ? err.message : 'Failed to crop image');
    }
  }, [cropArea, imageSrc, onCropComplete]);

  return (
    <div className="space-y-4">
      {/* Cropper */}
      <div className="relative h-72 rounded-xl overflow-hidden bg-gray-900">
        <ImageCropper
          imageSrc={imageSrc}
          className="w-full h-full"
          onCropComplete={handleCropAreaChange}
          aspect={1}
          cropShape="round"
          showGrid={false}
          minZoom={1}
          maxZoom={4}
        />
      </div>

      <p className="text-xs text-gray-500 text-center">
        Drag to reposition, scroll to zoom
      </p>

      {cropError && (
        <p className="text-sm text-red-600 text-center">{cropError}</p>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-2">
        <button
          onClick={onBack}
          disabled={isProcessing}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          Back
        </button>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isProcessing || !cropArea}
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <LoadingSpinner />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const SavingStep: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="mb-4">
        <LoadingSpinner size="lg" />
      </div>
      <p className="text-sm font-medium text-gray-700">Saving your photo...</p>
      <p className="text-xs text-gray-500 mt-1">This will only take a moment</p>
    </div>
  );
};

export default ProfilePhotoDialog;
