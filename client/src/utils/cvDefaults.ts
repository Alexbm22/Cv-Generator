import { MediaFilesAttributes } from "../interfaces/mediaFiles";
import { uploadImage } from "../services/MediaFiles";
import { getImageBlob } from "./blob";

const DEFAULT_PHOTO_PATH = "/Images/anonymous_Picture.png";

export const uploadDefaultPhoto = async (photoMediaFile: MediaFilesAttributes): Promise<void> => {
    try {
        const defaultPhotoBlob = await getImageBlob(DEFAULT_PHOTO_PATH);
        await uploadImage(defaultPhotoBlob, photoMediaFile);
    } catch (error) {
        console.error("Failed to upload default photo:", error);
        throw error;
    }
};

export const getDefaultPhotoPath = (): string => {
    return DEFAULT_PHOTO_PATH;
};