import { useCvEditStore, useCVsStore } from "../../../../../Store";
import { deleteImage, markMediaFileActiveStatus, uploadImage } from "../../../../../services/MediaFiles";
import { useEffect, useState } from "react";
import { CVStateMode } from "../../../../../interfaces/cv";
import { blobToBase64 } from "../../../../../utils/blob";
import { uploadDefaultPhoto } from "../../../../../utils/cvDefaults";
import { queryClient } from "../../../../../queryClient";
import { isUrlValid } from "../../../../../utils/urls";

const DEFAULT_PHOTO = "/Images/anonymous_Picture.png";

export const useCVPhotoState = () => {

    const CVState = useCVsStore(state => state.CVState);

    const UserCVPhoto = useCvEditStore((state) => state.UserPhoto);
    const GuestCVPhoto = useCvEditStore((state) => state.GuestPhoto);
    const setGuestPhoto = useCvEditStore((state) => state.setGuestPhoto);

    const isUser = CVState.mode === CVStateMode.USER;

    const [cvPhotoBlobUrl, setCvPhotoBlobUrl] = useState<string | null>(null);
    const [isLoadingPhotoUrl, setIsLoadingPhotoUrl] = useState(true);

    useEffect(() => {
        if (!isUser) {
            setCvPhotoBlobUrl(GuestCVPhoto ?? DEFAULT_PHOTO);
            setIsLoadingPhotoUrl(false);
            return;
        }

        const url = UserCVPhoto?.is_active ? UserCVPhoto.get_URL : null;

        if (!url) {
            setCvPhotoBlobUrl(DEFAULT_PHOTO);
            setIsLoadingPhotoUrl(false);
            return;
        }

        let cancelled = false;

        isUrlValid(url).then((isValid) => {
            if (cancelled) return;
            setCvPhotoBlobUrl(isValid ? url : DEFAULT_PHOTO);
            setIsLoadingPhotoUrl(false);
        });

        return () => { cancelled = true; };
    }, [isUser, GuestCVPhoto, UserCVPhoto?.get_URL, UserCVPhoto?.is_active]);

    const handleUserCropSuccess = async (cropResult: Blob) => {
        try {
            await uploadImage(cropResult, UserCVPhoto!);
            await markMediaFileActiveStatus(UserCVPhoto!.id, true);
            const { id } = useCvEditStore.getState();
            await queryClient.refetchQueries({ queryKey: [`CV:${id}`] });
        } catch (error) {
            const { id } = useCvEditStore.getState();
            queryClient.refetchQueries({ queryKey: [`CV:${id}`] });
            throw error;
        }
    }

    const handleGuestCropSuccess = async (cropResult: Blob) => {
        const base64Image = await blobToBase64(cropResult);
        setGuestPhoto(base64Image);
    }

    const handleCropSuccess = isUser ? handleUserCropSuccess : handleGuestCropSuccess;

    const handleUserPhotoDelete = async () => {
        try {
            await deleteImage(UserCVPhoto!);
            await uploadDefaultPhoto(UserCVPhoto!);
            const { id } = useCvEditStore.getState();
            await queryClient.refetchQueries({ queryKey: [`CV:${id}`] });
        } catch (error) {
            const { id } = useCvEditStore.getState();
            queryClient.refetchQueries({ queryKey: [`CV:${id}`] });
            throw error;
        }
    }

    const handleGuestPhotoDelete = async () => {
        setGuestPhoto(null);
    }

    const handleCVPhotoDelete = isUser ? handleUserPhotoDelete : handleGuestPhotoDelete;

    return {
        isLoadingPhotoUrl,
        cvPhotoBlobUrl,
        handleCropSuccess,
        handleCVPhotoDelete
    }
}