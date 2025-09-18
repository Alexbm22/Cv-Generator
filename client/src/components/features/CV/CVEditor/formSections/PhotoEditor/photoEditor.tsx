import React, { useState } from "react";
import PhotoSelector from "./photoSelector";
import CVPhotoCropper from './PhotoCropper.tsx'
import { useCVPhotoState } from "../../hooks/usePhotoEditor.ts";

export const PhotoEditor: React.FC = () => {
    
    const [ selectedPhoto, setSelectedPhoto ] = useState<string | null>(null);
    const [ isSelectingPhoto, setIsSelectingPhoto ] = useState<boolean>(false);
    
    const { 
        cvPhotoBlobUrl,
        handleCropSuccess,
        handleCVPhotoDelete
    } = useCVPhotoState()

    return (
        <>
            {
                isSelectingPhoto && (
                    <div className="absolute z-1 w-[100vw] h-full mt-[calc(-1 * var(--offset-y, 0px))] ml-[calc(-1 * var(--offset-x, 0px))]" onClick={() => {
                        setIsSelectingPhoto(false)
                    }} ></div>
                )
            }
            <div className="relative z-2">
                {
                    !isSelectingPhoto && (
                        <div className="absolute bottom-0 left-0 flex flex-row gap-x-4 justify-start items-end">

                            <img 
                                className="max-w-50 max-h-20 object-contain rounded-lg border-gray-300 shadow-sm" 
                                src={cvPhotoBlobUrl ?? "/Images/anonymous_Picture.png"} 
                                alt="Image"
                            />

                            {
                                !cvPhotoBlobUrl ? (
                                    <button
                                        onClick={() => {
                                            setIsSelectingPhoto(true);
                                        }}
                                    >
                                        +Add Photo
                                    </button>
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
        </>

    )
}

export default PhotoEditor;