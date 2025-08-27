import axios from "axios"
import { apiService } from "./api"

export const uploadImage = (blobObj: Blob, url: string) => {

    try {
        axios.put(url, blobObj, {
            headers: {
                'Content-Type': "image/png"
            }
        })    
    } catch (error) {
        console.error(error);
    }
}