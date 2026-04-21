import { MediaFilesAttributes } from "../../interfaces/mediaFiles";
import { QueryObserverResult, RefetchOptions, useQueryClient } from "@tanstack/react-query";
import { deleteImage, getMediaFileUrl, markMediaFileActiveStatus, uploadImage } from "../../services/MediaFiles";
import { isUrlValid } from "../../utils/urls";
import { useCallback } from "react";

export const useMediaFile = (mediaFile?: MediaFilesAttributes, refetch?: (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<MediaFilesAttributes, Error>>) => {
    const queryClient = useQueryClient();

    const getMediaFileGetUrl = useCallback(async () => {
        if (!mediaFile) {
            return null;
        }
        if (!mediaFile?.is_active) {
            return null;
        }

        let url = mediaFile.get_URL;
        if(!mediaFile.get_URL || mediaFile.expiresAt < Date.now()) {
            if (refetch) {
                const { data } = await refetch();
                if (!data?.is_active) {
                    url = null;
                }
    
                if (data?.get_URL && data.expiresAt >= Date.now()) {
                    url = data.get_URL;
                }
            } else {
                url = await getMediaFileUrl(mediaFile!.id, 'get');
            }
        }

        if (url && await isUrlValid(url)) {
            return url;
        }

        return null;
    }, [mediaFile, refetch]);

    const getMediaFilePutUrl = useCallback(async () => {
        if (!mediaFile) {
            return null;
        }

        if(!mediaFile?.put_URL || mediaFile.expiresAt < Date.now()) {
            if (refetch) {
                const { data } = await refetch();
                if (data?.put_URL && data.expiresAt >= Date.now()) {
                    return data.put_URL;
                }
            }
    
            return getMediaFileUrl(mediaFile!.id, 'put');
        } else return mediaFile.put_URL;
    }, [mediaFile, refetch]);

    const uploadMediaFile = useCallback(async (blobObj: Blob) => {
        try { 
            const url = await getMediaFilePutUrl();

            if (!url) {
                throw new Error("Unable to Upload Photo");
            }

            await uploadImage(url, blobObj);
    
            // Mark media file as active after successful upload
            if(!mediaFile?.is_active && mediaFile) {
                await markMediaFileActiveStatus(mediaFile.id, true);
            } 
        } catch (error) {
            console.error("Error uploading image:", error);
            throw error;
        }

        const blobUrl = URL.createObjectURL(blobObj);
        queryClient.setQueryData<MediaFilesAttributes>(
            ['mediaFile', mediaFile!.id],
            (prev) => prev ? { ...prev, is_active: true, get_URL: blobUrl, expiresAt: Date.now() + 10 * 60 * 1000 } : prev
        );
    }, [mediaFile, getMediaFilePutUrl, queryClient]);

    const deleteMediaFileImage = useCallback(async () => {
        await deleteImage(mediaFile!.id);

        queryClient.setQueryData<MediaFilesAttributes>(
            ['mediaFile', mediaFile!.id],
            (prev) => prev ? { ...prev, is_active: false, get_URL: null } : prev
        );
    }, [mediaFile, queryClient]);

    return { getMediaFileGetUrl, getMediaFilePutUrl, uploadMediaFile, deleteMediaFileImage };
}