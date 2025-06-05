import { useMutation } from "@tanstack/react-query"
import { CVAttributes } from "../interfaces/cv_interface"
import { apiService } from "../services/api"
import { ApiResponse } from "../interfaces/api_interface"

export const useSyncCV = () => {
    return useMutation<ApiResponse<null>, Error, CVAttributes>({
        mutationFn: async (cvObject: CVAttributes) => 
            apiService.post<ApiResponse<null>, CVAttributes>('/api/cv/sync', cvObject),
    })
}