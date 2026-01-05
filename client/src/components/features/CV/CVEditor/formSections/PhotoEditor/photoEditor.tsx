import React, { useState } from "react";
import PhotoSelector from "./photoSelector";
import CVPhotoCropper from './PhotoCropper.tsx'
import { useCVPhotoState } from "../../hooks/usePhotoEditor.ts";
import AddSectionButton from "../../../../../UI/AddSectionButton.tsx";
import { Edit, Trash2 } from 'lucide-react';
import Button from "../../../../../UI/Button.tsx";
import { ButtonStyles } from "../../../../../../constants/CV/buttonStyles.ts";

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

    const handleCancel = () => {
        setSelectedPhoto(null);
        setIsSelectingPhoto(false);
    }

    return (
        <div className="flex w-full h-full">
            {
                isSelectingPhoto && (
                    <div className="absolute z-1 w-[100vw] h-full mt-[calc(-1 * var(--offset-y, 0px))] ml-[calc(-1 * var(--offset-x, 0px))]" onClick={() => {
                        handleCancel()
                    }} ></div>
                )
            }
            <div className="flex-1 h-full z-2">
                {
                    !isSelectingPhoto && (
                        <div className="bottom-0 left-0 h-full flex flex-row gap-x-4 justify-start items-end p-4 border bg-[#eff9ff] border-gray-200 rounded-lg shadow-sm">

                            <div className="h-33 w-auto overflow-hidden">
                                <img 
                                    className="h-full w-auto object-cover rounded-lg border-gray-300 shadow-sm" 
                                    src={cvPhotoBlobUrl ?? "/Images/anonymous_Picture.png"} 
                                    alt="Image"
                                />
                            </div>

                            {
                                !cvPhotoBlobUrl ? (
                                    <AddSectionButton onClick={() => setIsSelectingPhoto(true)} sectionName={'Photo'} />
                                ) : (
                                    <div className="flex flex-col left-0 justify-start items-start">
                                        <Button
                                            onClick={() => {
                                                setIsSelectingPhoto(true);
                                                setSelectedPhoto(cvPhotoBlobUrl)
                                            }}
                                            buttonStyle={ButtonStyles.secondary}
                                            className="flex flex-row items-center gap-2 bg-transparent hover:bg-transparent hover:opacity-70 p-1"
                                        >
                                            <Edit className="w-4 h-4 sm:w-5 sm:h-5" /> 
                                            <span>Edit</span>
                                        </Button>
                                        <Button
                                            onClick={async () => {
                                                setSelectedPhoto(null)
                                                await handleCVPhotoDelete();
                                            }}
                                            buttonStyle={ButtonStyles.danger}
                                            className="flex flex-row items-center gap-2 bg-transparent hover:bg-transparent hover:opacity-70 "
                                        >
                                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" /> 
                                            <span>Delete</span>
                                        </Button>
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
                                handleSelectingCancel={handleCancel}
                            />
                        </div>
                    )
                }

                {   
                    (selectedPhoto && isSelectingPhoto) && (
                        <div className="bg-[#eff9ff] p-6 rounded-md shadow-md border border-gray-200">
                            <CVPhotoCropper 
                                imageSrc={selectedPhoto}
                                onCropFail={handleCancel}
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