import { ApiResponse } from "../interfaces/api_interface";
import { CVAttributes } from "../interfaces/cv_interface";
import { apiService } from "./api";

export class CVServerService {
    private static apiUrl = '/protected/cv/';

    public static async syncToServer(CVs: CVAttributes[]) {
        return await apiService.post<ApiResponse<CVAttributes[]>, CVAttributes[]>(
            this.apiUrl + 'sync_CVs',
            CVs
        )
    }

    public static async fetchFromServer() {
        return await apiService.get<ApiResponse<CVAttributes[]>>(
            this.apiUrl + 'get_CVs'
        )
    }

    public static async createNewCV() {
        return await apiService.post<ApiResponse<CVAttributes>>(
            this.apiUrl + 'create_CV'
        )
    }

    public static async createCVs(CVs: CVAttributes[]) {
        return await apiService.post<ApiResponse<CVAttributes[]>, CVAttributes[]>(
            this.apiUrl + 'create_existing_CVs',
            CVs
        )
    }

    public static async deleteCV(CVId: string) {
        return await apiService.post<ApiResponse<null>, string>(
            this.apiUrl + 'delete_CV',
            CVId
        )
    }
}