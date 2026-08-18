import React, { useState, useEffect, useRef } from "react";
import PhotoSelector from "./photoSelector";
import CVPhotoCropper from './PhotoCropper.tsx'
import { useCVPhotoState } from "../../hooks/usePhotoEditor.ts";
import { Edit, Trash2 } from 'lucide-react';
import { twMerge } from "tailwind-merge";
import { ButtonStyles } from "../../../../../../constants/CV/buttonStyles.ts";
import AddSectionButton from "../../../../../UI/Buttons/AddSectionButton.tsx";

type ComponentProps = {
    setIsSelectingPhoto: React.Dispatch<React.SetStateAction<boolean>>;
    isSelectingPhoto: boolean;
}

export const PhotoEditor: React.FC<ComponentProps> = ({ setIsSelectingPhoto, isSelectingPhoto }) => {
    
    const [ selectedPhoto, setSelectedPhoto ] = useState<string | null>(null);
    const photoEditorRef = useRef<HTMLDivElement>(null);
    
    const { 
        cvPhotoBlobUrl,
        handleCropSuccess,
        handleCVPhotoDelete,
        isPhotoActive
    } = useCVPhotoState()

    const handleCancel = () => {
        setSelectedPhoto(null);
        setIsSelectingPhoto(false);
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                isSelectingPhoto && 
                photoEditorRef.current && 
                !photoEditorRef.current.contains(event.target as Node)
            ) {
                handleCancel();
            }
        };

        if (isSelectingPhoto) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSelectingPhoto, selectedPhoto, handleCancel]);

    return (
        <div className="flex-1 h-full z-2" ref={photoEditorRef}>
            {
                !isSelectingPhoto && (
                    <div className="bottom-0 left-0 h-full flex flex-row gap-x-4 justify-start items-end p-4 border bg-white border-[#d2d2d7]/50 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.07)]">

                        <div className="h-33 w-auto overflow-hidden rounded-xl border border-[#d0d0d8] shadow-sm">
                            <img 
                                className="h-full w-auto object-cover" 
                                src={cvPhotoBlobUrl ?? "/Images/anonymous_Picture.png"} 
                                alt="Image"
                            />
                        </div>

                        {
                            !isPhotoActive ? (
                                <AddSectionButton onClick={() => setIsSelectingPhoto(true)} sectionName={'Photo'} />
                            ) : (
                                <div className="flex flex-col left-0 justify-start items-start">
                                    <button
                                        onClick={() => {
                                            setIsSelectingPhoto(true);
                                            setSelectedPhoto(cvPhotoBlobUrl)
                                        }}
                                        type="button"
                                        className="cursor-pointer text-[#0056b3] font-semibold flex flex-row items-center gap-2 bg-transparent hover:bg-transparent hover:text-[#004494] p-1"
                                    >
                                        <Edit className="w-4 h-4 sm:w-5 sm:h-5" /> 
                                        <span>Edit</span>
                                    </button>
                                    <button
                                        onClick={async () => {
                                            setSelectedPhoto(null);
                                            await handleCVPhotoDelete();
                                        }}
                                        type="button"
                                        className="cursor-pointer text-[#d9534f] font-semibold flex flex-row items-center gap-2 bg-transparent hover:bg-transparent hover:text-[#cf160f] p-1"
                                    >
                                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" /> 
                                        <span>Delete</span>
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
                            handleSelectingCancel={handleCancel}
                        />
                    </div>
                )
            }

            {   
                (selectedPhoto && isSelectingPhoto) && (
                    <div className="bg-white p-6 rounded-2xl border border-[#d2d2d7]/50 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
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

    )
}

export default PhotoEditor;