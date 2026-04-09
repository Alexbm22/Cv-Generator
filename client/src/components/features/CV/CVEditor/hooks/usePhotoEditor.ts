import { useQuery } from "@tanstack/react-query";
import { useCvEditStore, useCVsStore } from "../../../../../Store";
import { deleteImage, fetchFile, markMediaFileActiveStatus, uploadImage } from "../../../../../services/MediaFiles";
import { useEffect, useState } from "react";
import { CVStateMode } from "../../../../../interfaces/cv";
import { blobToBase64 } from "../../../../../utils/blob";
import { uploadDefaultPhoto } from "../../../../../utils/cvDefaults";
import { queryClient } from "../../../../../queryClient";

export const useCVPhotoState = () => {

    const CVState = useCVsStore(state => state.CVState)

    const UserCVPhoto = useCvEditStore((state) => state.UserPhoto);
    const photo_last_uploaded = useCvEditStore(state => state.photo_last_uploaded);

    const GuestCVPhoto = useCvEditStore((state) => state.GuestPhoto);
    const setGuestPhoto = useCvEditStore((state) => state.setGuestPhoto);

    const isUser = CVState.mode === CVStateMode.USER;

    const isFetchEnabled = !!UserCVPhoto?.get_URL && isUser && UserCVPhoto.is_active;

    const { data, isSuccess, isError, error, refetch } = useQuery({
        queryKey: ['cvPhoto'],
        queryFn: async () => await fetchFile(UserCVPhoto?.get_URL!),
        enabled: isFetchEnabled,
        staleTime: 600000,
        retry: false
    })

    const [ cvPhotoBlobUrl, setCvPhotoBlobUrl ] = useState<string | null>(null);
    const [ isLoadingPhotoUrl, setIsLoadingPhotoUrl ] = useState(true);

    useEffect(() => {
        if(isUser) {
            setCvPhotoBlobUrl(
                data && isSuccess && photo_last_uploaded ? URL.createObjectURL(data) : null
            );
        } else {
            setCvPhotoBlobUrl(GuestCVPhoto)
        }
        setIsLoadingPhotoUrl(false)
    }, [isUser, GuestCVPhoto, data, isError, isSuccess]);

    const handleUserCropSuccess = async (cropResult: Blob) => {
        try {
            await uploadImage(cropResult, UserCVPhoto!);
            
            await markMediaFileActiveStatus(UserCVPhoto!.id, true);
            useCvEditStore.getState().setPhotoLastUploaded(new Date());
            refetch();
        } catch (error) {
            const { id } = useCvEditStore.getState();
            queryClient.refetchQueries({queryKey: [`CV:${id}`]});
            throw error;
        }
    }

    const handleGuestCropSuccess = async (cropResult: Blob) => {
        const base64Image = await blobToBase64(cropResult)
        setGuestPhoto(base64Image);
    }

    const handleCropSuccess = isUser ? handleUserCropSuccess : handleGuestCropSuccess

    const handleUserPhotoDelete = async () => {
        try {
            await deleteImage(UserCVPhoto!);
            await uploadDefaultPhoto(UserCVPhoto!);
            useCvEditStore.getState().setPhotoLastUploaded(null);
            refetch();
        } catch (error) {
            const { id } = useCvEditStore.getState();
            queryClient.refetchQueries({queryKey: [`CV:${id}`]});
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