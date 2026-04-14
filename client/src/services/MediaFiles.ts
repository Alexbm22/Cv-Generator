import axios from "axios";
import { MediaFilesAttributes } from "../interfaces/mediaFiles";
import { apiService } from "./api";

const apiBaseUrl = '/protected/media_files';

export const uploadImage = async (blobObj: Blob, mediaFile: MediaFilesAttributes) => {
    try {
        const url = await getMediaFilePutUrl(mediaFile.id);

        await axios.put(url, blobObj, {
            headers: {
                'Content-Type': "image/png"
            }
        })

        // Mark media file as active after successful upload
        if(!mediaFile.is_active) {
            await markMediaFileActiveStatus(mediaFile.id, true);
        }
    } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
    }
}

export const fetchFile = async (url: string) => {
    try {
        return (await axios.get<Blob>(url, { responseType: 'blob' })).data
    } catch (error) {
        throw error;
    }
}

export const deleteImage = async (mediaFile: MediaFilesAttributes) => {
    try {
        await apiService.delete(`${apiBaseUrl}/${mediaFile.id}`);
    } catch (error) {
        return false;
    }
}

export const getMediaFilePutUrl = async (id: string) => {
    try {
        const response = await apiService.get<{ url: string }>(`${apiBaseUrl}/${id}/put_url`);
        return response.url;
    } catch (error) {
        throw error;
    }
}

export const getMediaFileById = async (id: string) => {
    try {
        const mediaFile = await apiService.get<MediaFilesAttributes>(
            `${apiBaseUrl}/${id}`
        );
        return mediaFile;
    } catch (error) {
        throw error;
    }
}

export const markMediaFileActiveStatus = async (id: string, isActive: boolean) => {
    try {
        const updatedMediaFile = await apiService.patch<MediaFilesAttributes>(
            `${apiBaseUrl}/${id}/active`,
            { is_active: isActive }
        );
        return updatedMediaFile;
    } catch (error) {
        throw error;
    }
}