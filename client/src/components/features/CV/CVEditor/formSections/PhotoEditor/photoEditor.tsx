import React, { useState } from "react";
import PhotoSelector from "./photoSelector";
import CVPhotoCropper from './PhotoCropper.tsx'
import { useCVPhotoState } from "../../hooks/usePhotoEditor.ts";
import AddSectionButton from "../../../../../UI/AddSectionButton.tsx";

type ComponentProps = {
    setIsSelectingPhoto: React.Dispatch<React.SetStateAction<boolean>>;
    isSelectingPhoto: boolean;
}

export const PhotoEditor: React.FC<ComponentProps> = ({ setIsSelectingPhoto, isSelectingPhoto }) => {
    
    const [ selectedPhoto, setSelectedPhoto ] = useState<string | null>(null);
    
    const { 
        cvPhotoBlobUrl,
        handleCropSuccess,
        handleCVPhotoDelete
    } = useCVPhotoState()

    return (
        <div className="flex w-full h-full">
            {
                isSelectingPhoto && (
                    <div className="absolute z-1 w-[100vw] h-full mt-[calc(-1 * var(--offset-y, 0px))] ml-[calc(-1 * var(--offset-x, 0px))]" onClick={() => {
                        setIsSelectingPhoto(false)
                    }} ></div>
                )
            }
            <div className="flex-1 relative h-full z-2">
                {
                    !isSelectingPhoto && (
                        <div className="absolute bottom-0 left-0 flex flex-row gap-x-4 justify-start items-end">

                            <img 
                                className="max-w-80 max-h-30 object-contain rounded-lg border-gray-300 shadow-sm" 
                                src={cvPhotoBlobUrl ?? "/Images/anonymous_Picture.png"} 
                                alt="Image"
                            />

                            {
                                !cvPhotoBlobUrl ? (
                                    <AddSectionButton OnClick={() => setIsSelectingPhoto(true)} sectionName={'Photo'} />
                                ) : (
                                    <div>
                                        <button
                                            onClick={() => {
                                                setIsSelectingPhoto(true);
                                                setSelectedPhoto(cvPhotoBlobUrl)
                                            }}
                                        >
                                            Edit Photo
                                        </button>
                                        <button
                                            onClick={async () => {
                                                setSelectedPhoto(null)
                                                await handleCVPhotoDelete();
                                            }}
                                        >
                                            Delete Photo
                                        </button>
                                    </div>
                                )
                            }

                        </div>
                    )
                }

                {
                    (!selectedPhoto && isSelectingPhoto) && (
                        <div className="w-full h-full">
                            <PhotoSelector 
                                setSelectedPhoto={setSelectedPhoto}
                                setIsSelectingPhoto={setIsSelectingPhoto}
                            />
                        </div>
                    )
                }

                {   
                    (selectedPhoto && isSelectingPhoto) && (
                        <div>
                            <CVPhotoCropper 
                                imageSrc={selectedPhoto}
                                setImageSource={setSelectedPhoto}
                                onCroppSuccess={async (cropResult) => {
                                    await handleCropSuccess(cropResult);
                                    setIsSelectingPhoto(false);
                                    setSelectedPhoto(null);
                                }}
                                setIsSelectingPhoto={setIsSelectingPhoto}
                            />
                        </div>
                    )
                }
            </div>
        </div>

    )
}

export default PhotoEditor;