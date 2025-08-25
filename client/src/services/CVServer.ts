import { CVAttributes, CVMetadataAttributes } from "../interfaces/cv";
import { apiService } from "./api";

export class CVServerService {
    private static apiUrl = '/protected/cvs';

    public static async sync(CVs: CVAttributes[]) {
        return await apiService.put<CVAttributes[] | null, CVAttributes[]>(
            this.apiUrl + '/sync',
            CVs
        )
    }

    public static async fetch() {
        return await apiService.get<CVMetadataAttributes[]>(
            this.apiUrl
        )
    }

    public static async createNewCV() {
        return await apiService.post<CVMetadataAttributes>(
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