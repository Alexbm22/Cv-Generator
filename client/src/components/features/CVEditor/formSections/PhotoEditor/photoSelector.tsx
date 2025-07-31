import React, { useRef } from "react";
import { CV_EDITOR_FORM_CONSTANTS } from "../../../../../constants/CV/CVEditor";
import type { SetStateAction, Dispatch } from "react";

const { personal_infos: personalInfosConstants } = CV_EDITOR_FORM_CONSTANTS.sections;
const { fields: fieldsConstants } = personalInfosConstants;

type PhotoSelectorProps = {
    setSelectedPhoto: Dispatch<SetStateAction<string | null>>,
    setIsSelectingPhoto: Dispatch<SetStateAction<boolean>>,
}

export const PhotoSelector: React.FC<PhotoSelectorProps> = ({setSelectedPhoto, setIsSelectingPhoto}) => {
    
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
            <div className="flex flex-col justify-center w-full h-full border border-gray-300 rounded-md">
                <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="relative flex flex-col items-center justify-center cursor-default"
                >
                    <p>Drag and drop your photo</p>

                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="mt-4 px-4 py-2 bg-amber-300 rounded cursor-pointer"
                    >
                        Select Photo
                    </button>

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