import { useCvEditStore, useCVsStore } from "../../../../../Store";
import { deleteImage, getMediaFileById, markMediaFileActiveStatus, uploadImage } from "../../../../../services/MediaFiles";
import { CVStateMode } from "../../../../../interfaces/cv";
import { blobToBase64 } from "../../../../../utils/blob";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { isUrlValid } from "../../../../../utils/urls";
const DEFAULT_PHOTO = "/Images/anonymous_Picture.png";

export const useCVPhotoState = () => {

    const CVState = useCVsStore(state => state.CVState);

    const UserCVPhoto = useCvEditStore((state) => state.UserPhoto);
    const GuestCVPhoto = useCvEditStore((state) => state.GuestPhoto);
    const setGuestPhoto = useCvEditStore((state) => state.setGuestPhoto);

    const [cvPhotoBlobUrl, setCvPhotoBlobUrl] = useState<string>(DEFAULT_PHOTO);
    const [isActive, setIsActive] = useState<boolean>(false);

    const isUser = CVState.mode === CVStateMode.USER;

    const { data: cvPhotoData, isLoading: isLoadingPhotoUrl, refetch } = useQuery({
        queryKey: ['mediaFile', UserCVPhoto?.id],
        queryFn: () => getMediaFileById(UserCVPhoto!.id),
        enabled: isUser && !!UserCVPhoto?.id,
        staleTime: 60 * 1000 * 5,
    });

    useEffect(() => {
        if(isUser && cvPhotoData?.is_active) {
            isUrlValid(cvPhotoData.get_URL).then(valid => {
                setCvPhotoBlobUrl(valid ? cvPhotoData.get_URL : DEFAULT_PHOTO);
                setIsActive(valid);
            })
        }
        else {
            if(isUser) {
                setCvPhotoBlobUrl(DEFAULT_PHOTO);
                setIsActive(false);
            }
            else {
                setCvPhotoBlobUrl(GuestCVPhoto ?? DEFAULT_PHOTO);
                setIsActive(!!GuestCVPhoto);
            }
        }
    }, [isUser, cvPhotoData, GuestCVPhoto]);

    const handleUserCropSuccess = async (cropResult: Blob) => {
        try {
            await uploadImage(cropResult, UserCVPhoto!);
            await markMediaFileActiveStatus(UserCVPhoto!.id, true);
            await refetch();
        } catch (error) {
            await refetch();
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
            await refetch();
        } catch (error) {
            await refetch();
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
        isPhotoActive: isActive,
        handleCropSuccess,
        handleCVPhotoDelete
    }
}