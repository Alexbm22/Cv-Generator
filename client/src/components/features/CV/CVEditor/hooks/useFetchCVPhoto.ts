import { useQuery } from "@tanstack/react-query";
import { useCvEditStore } from "../../../../../Store";
import { fetchImage } from "../../../../../services/MediaFiles";
import { useEffect, useState } from "react";

export const useFetchCVPhoto = () => {
    const cvPhotoMetaData = useCvEditStore((state) => state.photo);
    const isFetchEnabled = !!cvPhotoMetaData?.presigned_get_URL.url; // to add auth state and verify expiration date

    const { data, isSuccess, isError, error, refetch } = useQuery({
        queryKey: ['cvPhoto'],
        queryFn: async () => await fetchImage(cvPhotoMetaData?.presigned_get_URL.url!),
        enabled: isFetchEnabled,
        staleTime: 600000,
        retry: false
    })

    const [ cvPhotoSource, setCvPhotoSource ] = useState<string | null>(null)

    useEffect(() => {
        if(data && isSuccess) {
            const blobUrl = URL.createObjectURL(data);
            setCvPhotoSource(blobUrl);
        } else {
            setCvPhotoSource(null);
        }

        if(isError) console.error(error)
    }, [data])

    return {
        cvPhotoSource,
        setCvPhotoSource,
        refetchPhoto: refetch
    }
}