import { useState, useCallback } from 'react';
import { useAuthStore } from '../Store';
import { useMediaFileQuery } from './MediaFile/useMediaFileQuery';
import { useMediaFile } from './MediaFile/useMediaFile';

export type DialogStep = 'select' | 'crop' | 'saving';

interface UseProfilePhotoEditorReturn {
  isDialogOpen: boolean;
  currentStep: DialogStep;
  selectedImage: string | null;
  isProcessing: boolean;
  error: string | null;
  
  openDialog: () => void;
  closeDialog: () => void;
  setSelectedImage: (image: string | null) => void;
  goToStep: (step: DialogStep) => void;
  handleSave: (imageBlob: Blob) => Promise<void>;
  resetDialogState: () => void;
}

export const useProfilePhotoEditor = (): UseProfilePhotoEditorReturn => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<DialogStep>('select');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const profilePictureId = useAuthStore((state) => state.profilePictureId);

  const { data: profilePicture, refetch } = useMediaFileQuery(profilePictureId!);
  const { uploadMediaFile} = useMediaFile(profilePicture, refetch);

  const resetDialogState = useCallback(() => {
    setCurrentStep('select');
    setSelectedImage(null);
    setIsProcessing(false);
    setError(null);
  }, []);

  const openDialog = useCallback(() => {
    resetDialogState();
    setIsDialogOpen(true);
  }, [resetDialogState]);

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
    // Reset state after dialog closes for clean re-opening
    setTimeout(resetDialogState, 150);
  }, [resetDialogState]);

  const goToStep = useCallback((step: DialogStep) => {
    setCurrentStep(step);
    setError(null);
  }, []);

  const handleSave = useCallback(async (imageBlob: Blob) => {
    if (!profilePictureId) {
      setError('Profile picture not found');
      return;
    }

    setIsProcessing(true);
    setCurrentStep('saving');
    setError(null);

    try {
      if (profilePicture) {
        await uploadMediaFile(imageBlob);
        closeDialog();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save profile picture';
      setError(errorMessage);
      setCurrentStep('crop');
    } finally {
      setIsProcessing(false);
    }
  }, [profilePictureId, closeDialog, profilePicture, uploadMediaFile]);

  return {
    isDialogOpen,
    currentStep,
    selectedImage,
    isProcessing,
    error,
    openDialog,
    closeDialog,
    setSelectedImage,
    goToStep,
    handleSave,
    resetDialogState,
  };
};

export default useProfilePhotoEditor;
