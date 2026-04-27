import React, { useRef } from "react";
import { CV_EDITOR_FORM_CONSTANTS } from "../../../../../../constants/CV/CVEditor";
import type { SetStateAction, Dispatch } from "react";

const { personal_infos: personalInfosConstants } = CV_EDITOR_FORM_CONSTANTS.sections;
const { fields: fieldsConstants } = personalInfosConstants;

type PhotoSelectorProps = {
    setSelectedPhoto: Dispatch<SetStateAction<string | null>>,
    setIsSelectingPhoto: Dispatch<SetStateAction<boolean>>,
    handleSelectingCancel: () => void;
}

export const PhotoSelector: React.FC<PhotoSelectorProps> = ({handleSelectingCancel, setSelectedPhoto, setIsSelectingPhoto}) => {
    
    const readFile = (file?: File) => {
        if (file) {
            const reader = new FileReader();

            reader.readAsDataURL(file);

            reader.onloadend = async () => {
                const base64 = reader.result as string;
                setSelectedPhoto(base64);
                setIsSelectingPhoto(true);
            };

            reader.onerror = (error) => {
                console.error('Error reading file:', error);
            };
        }
    } 

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile.type.startsWith("image/")) {
            readFile(droppedFile);
        }
    };

    // enables drop events to fire on the element
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setIsSelectingPhoto(true);
        readFile(file);
    }

    const inputRef = useRef<HTMLInputElement>(null);

    return (
            <div className="flex flex-col justify-center w-full h-full min-h-40 border border-[#d2d2d7]/50 bg-white rounded-2xl font-medium shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
                <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="relative flex flex-col items-center justify-center cursor-default"
                >
                    <p className="text-[#6e6e73] text-sm">Drag and drop your photo</p>

                    <div className="flex mt-4 gap-x-2">
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            className="font-medium text-sm py-2 px-4 text-white w-fit cursor-pointer bg-[#0071e3] 
                            hover:bg-[#0060c7] transition-colors duration-200 rounded-full"
                        >
                            Select Photo
                        </button>
                        <button
                            type="button"
                            onClick={handleSelectingCancel}
                            className="font-medium text-sm py-2 px-4 text-[#0071e3] w-fit cursor-pointer bg-[#f5f5f7] border border-[#d2d2d7]/60
                            hover:bg-[#e8e8ed] transition-colors duration-200 rounded-full"
                        >
                            Cancel
                        </button>
                    </div>

                    <input
                        id="photo"
                        ref={inputRef}
                        className="hidden"
                        type={fieldsConstants.photo.type}
                        accept={fieldsConstants.photo.accept}
                        onChange={handleFileSelect}
                    />
                </div>
            </div>
    )
}

export default PhotoSelector;