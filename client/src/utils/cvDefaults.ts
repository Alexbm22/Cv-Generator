import { getImageBlob } from "./blob";
import { uploadImage } from "../services/MediaFiles";
import { MediaFilesAttributes } from "../interfaces/mediaFiles";

const DEFAULT_PHOTO_PATH = "/Images/anonymous_Picture.png";

/**
 * Uploads the default anonymous profile picture to a media file
 * @param photoMediaFile - The media file object where the photo should be uploaded
 * @returns Promise that resolves when upload is complete
 */
export const uploadDefaultPhoto = async (photoMediaFile: MediaFilesAttributes): Promise<void> => {
    try {
        const defaultPhotoBlob = await getImageBlob(DEFAULT_PHOTO_PATH);
        await uploadImage(defaultPhotoBlob, photoMediaFile);
    } catch (error) {
        console.error("Failed to upload default photo:", error);
        throw error;
    }
};

/**
 * Gets the default photo path for CV rendering
 * @returns The path to the default anonymous picture
 */
export const getDefaultPhotoPath = (): string => {
    return DEFAULT_PHOTO_PATH;
};