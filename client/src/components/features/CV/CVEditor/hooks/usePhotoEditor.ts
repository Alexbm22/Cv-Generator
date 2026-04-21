import { useCvEditStore, useCVsStore } from "../../../../../Store";
import { CVStateMode } from "../../../../../interfaces/cv";
import { blobToBase64 } from "../../../../../utils/blob";
import { useCallback, useEffect, useState } from "react";
import { useMediaFileQuery } from "../../../../../hooks/MediaFile/useMediaFileQuery";
import { useMediaFile } from "../../../../../hooks/MediaFile/useMediaFile";
const DEFAULT_PHOTO = "/Images/anonymous_Picture.png";

export const useCVPhotoState = () => {

    const CVState = useCVsStore(state => state.CVState);

    const UserCVPhotoId = useCvEditStore((state) => state.UserPhotoId);
    const GuestCVPhoto = useCvEditStore((state) => state.GuestPhoto);
    const setGuestPhoto = useCvEditStore((state) => state.setGuestPhoto);

    const [cvPhotoBlobUrl, setCvPhotoBlobUrl] = useState<string>(DEFAULT_PHOTO);
    const [isActive, setIsActive] = useState<boolean>(false);

    const isUser = CVState.mode === CVStateMode.USER;

    const { data: cvPhotoData, isLoading: isLoadingPhotoUrl, refetch } = useMediaFileQuery(UserCVPhotoId!, isUser);
    const { getMediaFileGetUrl, uploadMediaFile, deleteMediaFileImage } = useMediaFile(cvPhotoData, refetch);

    const fetchPhotoUrl = useCallback(async () => {
        if (isUser) {
            const url = await getMediaFileGetUrl();
            setCvPhotoBlobUrl(url ?? DEFAULT_PHOTO);
            setIsActive(!!url);
        } else {
            setCvPhotoBlobUrl(GuestCVPhoto ?? DEFAULT_PHOTO);
            setIsActive(!!GuestCVPhoto);
        }
    }, [isUser, GuestCVPhoto, getMediaFileGetUrl]);

    useEffect(() => {
        fetchPhotoUrl();
    }, [fetchPhotoUrl]);

    const handleUserCropSuccess = useCallback(async (cropResult: Blob) => {
        try {
            await uploadMediaFile(cropResult);
        } catch (error) {
            await refetch();
            throw error;
        }
    }, [uploadMediaFile, refetch]);

    const handleGuestCropSuccess = useCallback(async (cropResult: Blob) => {
        const base64Image = await blobToBase64(cropResult);
        setGuestPhoto(base64Image);
    }, [setGuestPhoto]);

    const handleCropSuccess = isUser ? handleUserCropSuccess : handleGuestCropSuccess;

    const handleUserPhotoDelete = useCallback(async () => {
        try {
            await deleteMediaFileImage();
        } catch (error) {
            await refetch();
            throw error;
        }
    }, [deleteMediaFileImage, refetch]);

    const handleGuestPhotoDelete = useCallback(async () => {
        setGuestPhoto(null);
    }, [setGuestPhoto]);

    const handleCVPhotoDelete = isUser ? handleUserPhotoDelete : handleGuestPhotoDelete;

    return {
        isLoadingPhotoUrl,
        cvPhotoBlobUrl,
        isPhotoActive: isActive,
        handleCropSuccess,
        handleCVPhotoDelete
    }
}