import axios from "axios";
import { MediaFilesAttributes, Url } from "../interfaces/mediaFiles";
import { apiService } from "./api";

const apiBaseUrl = '/protected/media_files';

export const fetchFile = async (url: string) => {
    return (await axios.get<Blob>(url, { responseType: 'blob' })).data;
}

export const deleteImage = async (mediaFileId: string) => {
    try {
        await apiService.delete(`${apiBaseUrl}/${mediaFileId}`);
    } catch (error) {
        console.error("Error deleting image:", error);
        return false;
    }
}

export const getMediaFileUrl = async (mediaFileId: string, url: Url) => {
    const response = await apiService.get<{ url: string | null }>(`${apiBaseUrl}/${mediaFileId}/${url}_url`);
    return response.url;
}

export const getMediaFileById = async (id: string) => {
    const mediaFile = await apiService.get<MediaFilesAttributes>(
        `${apiBaseUrl}/${id}`
    );
    return mediaFile;
}

export const uploadImage = async (url: string, blobObj: Blob) => {
    return await axios.put(url, blobObj, {
        headers: {
            'Content-Type': "image/png"
        }
    })
}
        

export const markMediaFileActiveStatus = async (id: string, isActive: boolean) => {
    const updatedMediaFile = await apiService.patch<MediaFilesAttributes>(
        `${apiBaseUrl}/${id}/active`,
        { is_active: isActive }
    );
    return updatedMediaFile;
}