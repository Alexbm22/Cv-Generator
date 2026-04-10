import React, { memo } from 'react';
import { Camera } from 'lucide-react';
import useProfilePictureUrl from '../../hooks/useProfilePictureUrl';
import useProfilePhotoEditor from '../../hooks/useProfilePhotoEditor';
import ProfilePhotoDialog from './ProfilePhotoDialog';

interface ProfilePictureEditorProps {
  className?: string;
}

const ProfilePictureEditor: React.FC<ProfilePictureEditorProps> = memo(({
  className = '',
}) => {
  const { profilePictureUrl } = useProfilePictureUrl();
  
  const {
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
  } = useProfilePhotoEditor();
  
  return (
    <>
      {/* Profile Picture Container */}
      <div className={`relative inline-block ${className}`}>
        {/* Profile Image */}
        <div
          className="
            rounded-full overflow-hidden
            w-55 h-55
            ring-4 ring-white
            shadow-lg
            bg-gray-100"
        >
          <img
            src={profilePictureUrl}
            alt="Profile"
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Edit Button */}
        <button
          onClick={openDialog}
          className={`
            h-10 w-10 bottom-1.5 right-1.5
            absolute
            flex items-center justify-center
            rounded-full
            bg-white
            border border-gray-200
            shadow-md
            text-[#237bff]
            hover:bg-gray-50 hover:text-[#2a72de] hover:border-gray-300
            active:scale-95
            cursor-pointer
            transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          `}
          aria-label="Edit profile picture"
          type="button"
        >
          <Camera className="h-6 w-6" />
        </button>
      </div>

      {/* Edit Dialog */}
      <ProfilePhotoDialog
        isOpen={isDialogOpen}
        currentStep={currentStep}
        selectedImage={selectedImage}
        isProcessing={isProcessing}
        error={error}
        onClose={closeDialog}
        onImageSelect={setSelectedImage}
        onStepChange={goToStep}
        onSave={handleSave}
      />
    </>
  );
});

ProfilePictureEditor.displayName = 'ProfilePictureEditor';

export default ProfilePictureEditor;
