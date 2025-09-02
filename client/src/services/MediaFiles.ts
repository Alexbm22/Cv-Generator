import axios from "axios";

export const uploadImage = async (blobObj: Blob, url: string) => {
    try {
        await axios.put(url, blobObj, {
            headers: {
                'Content-Type': "image/png"
            }
        })    
    } catch (error) {
        throw error;
    }
}

export const fetchImage = async (url: string) => {
    try {
        return (await axios.get<Blob>(url, {
            responseType: 'blob'
        })).data
    } catch (error) {
        throw error;
    }
}

export const validateImage = async (url: string) => {
    try {
        await axios.head(url);
        return true;
    } catch (error) {
        return false;
    }
}