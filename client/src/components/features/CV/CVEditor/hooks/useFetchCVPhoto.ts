import { useQuery } from "@tanstack/react-query";
import { useCvEditStore } from "../../../../../Store";
import { fetchImage } from "../../../../../services/MediaFiles";
import { useEffect, useState } from "react";

export const useFetchCVPhoto = () => {
    const cvPhotoMetaData = useCvEditStore((state) => state.photo);
    const isFetchEnabled = !!cvPhotoMetaData?.presigned_get_URL; // to add auth state and verify expiration date

    const { data, isSuccess, isError, error, refetch } = useQuery({
        queryKey: ['cvPhoto'],
        queryFn: async () => await fetchImage(cvPhotoMetaData!),
        enabled: isFetchEnabled,
        staleTime: 600000,
        retry: false
    })

    const [ cvPhotoBlobUrl, setCvPhotoBlobUrl ] = useState<string | null>(null)

    useEffect(() => {
        setCvPhotoBlobUrl(
            data && isSuccess ? URL.createObjectURL(data) : null
        );
    }, [data, isError, isSuccess])

    return {
        cvPhotoBlobUrl,
        setCvPhotoBlobUrl,
        refetchPhoto: refetch
    }
}