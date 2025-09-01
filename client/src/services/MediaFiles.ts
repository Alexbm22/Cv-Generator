import axios from "axios";

export const uploadImage = async (blobObj: Blob, url: string) => {

    try {
        await axios.put(url, blobObj, {
            headers: {
                'Content-Type': "image/png"
            }
        })    
    } catch (error) {
        console.error(error);
    }
}