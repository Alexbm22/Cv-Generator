import { ApiResponse } from "../interfaces/api_interface";
import { CVAttributes } from "../interfaces/cv_interface";
import { apiService } from "./api";

export class CVServerService {
    private static apiUrl = '/protected/cvs';

    public static async syncToServer(CVs: CVAttributes[]) {
        return await apiService.put<ApiResponse<CVAttributes[]>, CVAttributes[] | null>(
            this.apiUrl + '/sync',
            CVs
        )
    }

    public static async fetchFromServer() {
        return await apiService.get<ApiResponse<CVAttributes[]>>(
            this.apiUrl
        )
    }

    public static async createNewCV() {
        return await apiService.post<ApiResponse<CVAttributes>>(
            this.apiUrl
        )
    }

    public static async createCVs(CVs: CVAttributes[]) {
        return await apiService.post<ApiResponse<CVAttributes[]>, CVAttributes[]>(
            this.apiUrl + '/import',
            CVs
        )
    }

    public static async deleteCV(CVId: string) {
        return await apiService.delete<ApiResponse<null>>(
            this.apiUrl + `/${CVId}`
        )
    }
}