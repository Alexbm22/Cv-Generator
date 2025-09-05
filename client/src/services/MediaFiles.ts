import axios from "axios";
import { MediaFilesAttributes } from "../interfaces/mediaFiles";
import { apiService } from "./api";

export const uploadImage = async (blobObj: Blob, mediaFile: MediaFilesAttributes) => {
    try {
        if(mediaFile.expiresAt < Date.now()) {
            mediaFile = await getMediaFileById(mediaFile.id);
        }

        await axios.put(mediaFile.presigned_put_URL, blobObj, {
            headers: {
                'Content-Type': "image/png"
            }
        })    
    } catch (error) {
        throw error;
    }
}

export const fetchImage = async (mediaFile: MediaFilesAttributes) => {
    try {
        if(mediaFile.expiresAt < Date.now()) {
            mediaFile = await getMediaFileById(mediaFile.id);
        }

        return (await axios.get<Blob>(
            mediaFile.presigned_get_URL, {
                responseType: 'blob'
            }
        )).data
    } catch (error) {
        throw error;
    }
}

export const deleteImage = async (mediaFile: MediaFilesAttributes) => {
    try {
        if(mediaFile.expiresAt < Date.now()) {
            mediaFile = await getMediaFileById(mediaFile.id);
        }
        
        await axios.delete(mediaFile.presigned_delete_URL);
        return true;
    } catch (error) {
        return false;
    }
}

export const getMediaFileById = async (id: string) => {
    try {
        const mediaFile = await apiService.get<MediaFilesAttributes>(
            `/protected/media_files/${id}`
        );
        return mediaFile;
    } catch (error) {
        throw error;
    }
}