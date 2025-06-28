import { ApiResponse } from "../interfaces/api_interface";
import { CVAttributes } from "../interfaces/cv_interface";
import { useCVsStore } from "../Store";
import { apiService } from "./api";

export class CVServerService {
    private apiUrl = '/protected/cv/';

    public async syncToServer() {
        const { lastSynced, CVs } = useCVsStore.getState();

        // sync just the updated CVs
        const changedCVs = CVs.filter((cv) => 
            cv.updatedAt && cv.updatedAt > lastSynced!
        )

        return await apiService.post<ApiResponse<CVAttributes[]>, CVAttributes[]>(
            this.apiUrl + 'sync_CVs',
            changedCVs
        )
    }

    public async fetchFromServer() {
        return await apiService.get<ApiResponse<CVAttributes[]>>(
            this.apiUrl + 'get_CVs'
        )
    }

    public async createNewCV() {
        return await apiService.post<ApiResponse<CVAttributes>>(
            this.apiUrl + 'create_CV'
        )
    }

    public async createCVs() {

        const { CVs } = useCVsStore.getState();

        return await apiService.post<ApiResponse<null>, CVAttributes[]>(
            '/protected/create_existing_CVs',
            CVs
        )
    }

    public async deleteCV(CVId: string) {
        return await apiService.post<ApiResponse<null>, string>(
            '/protected/delete_CV',
            CVId
        )
    }
}

const CVServerServiceInstance = new CVServerService();

export default CVServerServiceInstance;