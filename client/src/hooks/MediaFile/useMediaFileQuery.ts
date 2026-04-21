import { useQuery } from "@tanstack/react-query";
import { getMediaFileById } from "../../services/MediaFiles";

export const useMediaFileQuery = (mediaFileId: string, enableConditions?: boolean) => {
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['mediaFile', mediaFileId],
        queryFn: () => getMediaFileById(mediaFileId),
        enabled: !!mediaFileId && (enableConditions === undefined || enableConditions),
        staleTime: 4 * 60 * 1000,
    });

    return { data, isLoading, refetch };
}