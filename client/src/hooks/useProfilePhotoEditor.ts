import { useState, useCallback } from 'react';
import { useAuthStore } from '../Store';
import { uploadImage, getMediaFileById } from '../services/MediaFiles';
import { MediaFilesAttributes } from '../interfaces/mediaFiles';

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

  const profilePicture = useAuthStore((state) => state.profilePicture);
  const setProfilePicture = useAuthStore((state) => state.setProfilePicture);

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
    if (!profilePicture?.id) {
      setError('Profile picture configuration not found');
      return;
    }

    setIsProcessing(true);
    setCurrentStep('saving');
    setError(null);

    try {
      await uploadImage(imageBlob, profilePicture as MediaFilesAttributes);
      const freshMediaFile = await getMediaFileById(profilePicture.id);
      setProfilePicture(freshMediaFile);
      closeDialog();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save profile picture';
      setError(errorMessage);
      setCurrentStep('crop');
    } finally {
      setIsProcessing(false);
    }
  }, [profilePicture, closeDialog]);

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
