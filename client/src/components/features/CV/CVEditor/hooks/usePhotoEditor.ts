import { useQuery } from "@tanstack/react-query";
import { useCvEditStore, useCVsStore } from "../../../../../Store";
import { deleteImage, fetchImage, uploadImage } from "../../../../../services/MediaFiles";
import { useEffect, useState } from "react";
import { CVStateMode } from "../../../../../interfaces/cv";

export const useCVPhotoState = () => {

    const CVState = useCVsStore(state => state.CVState)
    const UserCVPhoto =  useCvEditStore((state) => state.UserPhoto);
    const GuestCVPhoto = useCvEditStore((state) => state.GuestPhoto);
    const setGuestPhoto = useCvEditStore((state) => state.setGuestPhoto);

    const isUser = CVState.mode === CVStateMode.USER;

    const isFetchEnabled = !!UserCVPhoto?.presigned_get_URL 
        && isUser; 

    const { data, isSuccess, isError, error, refetch } = useQuery({
        queryKey: ['cvPhoto'],
        queryFn: async () => await fetchImage(UserCVPhoto!),
        enabled: isFetchEnabled,
        staleTime: 600000,
        retry: false
    })

    const [ cvPhotoBlobUrl, setCvPhotoBlobUrl ] = useState<string | null>(null)

    useEffect(() => {
        if(isUser) {
            setCvPhotoBlobUrl(
                data && isSuccess ? URL.createObjectURL(data) : null
            );
        } else {
            setCvPhotoBlobUrl(GuestCVPhoto)
        }
    }, [isUser, GuestCVPhoto, data, isError, isSuccess]);

    const handleUserCropSuccess = async (cropResult: Blob) => {
        await uploadImage(cropResult, UserCVPhoto!);
        refetch();
    } 

    const handleGuestCropSuccess = async  (cropResult: Blob) => {
        const resultUrl = URL.createObjectURL(cropResult);
        setGuestPhoto(resultUrl)
    }

    const handleCropSuccess = isUser ? handleUserCropSuccess : handleGuestCropSuccess

    const handleUserPhotoDelete = async () => {
        await deleteImage(UserCVPhoto!);
        refetch();
    }

    const handleGuestPhotoDelete = async () => {
        setGuestPhoto(null);
    }

    const handleCVPhotoDelete = isUser ? handleUserPhotoDelete : handleGuestPhotoDelete;

    return {
        cvPhotoBlobUrl,
        handleCropSuccess,
        handleCVPhotoDelete
    }
}