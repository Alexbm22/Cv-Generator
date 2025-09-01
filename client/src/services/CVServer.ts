import { CVAttributes, CVMetadataAttributes } from "../interfaces/cv";
import { apiService } from "./api";

export class CVServerService {
    private static apiUrl = '/protected/cvs';

    public static async sync(CV: CVAttributes) {
        return await apiService.patch<void, CVAttributes>(
            this.apiUrl + `/${CV.id}`,
            CV
        )
    }

    public static async getCV(cvId: string) {
        return await apiService.get<CVAttributes>(
            this.apiUrl + `/${cvId}`
        )
    }

    public static async getCVs() {
        return await apiService.get<CVMetadataAttributes[]>(
            this.apiUrl
        )
    }

    public static async createNewCV() {
        return await apiService.post<CVAttributes>(
            this.apiUrl
        )
    }

    public static async createCVs(CVs: CVAttributes[]) {
        return await apiService.post<CVAttributes[], CVAttributes[]>(
            this.apiUrl + '/import',
            CVs
        )
    }

    public static async deleteCV(CVId: string) {
        return await apiService.delete<null>(
            this.apiUrl + `/${CVId}`
        )
    }
}