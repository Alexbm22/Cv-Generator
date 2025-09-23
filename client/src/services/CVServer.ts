import { UserCVAttributes, CVMetadataAttributes, GuestCVAttributes } from "../interfaces/cv";
import { apiService } from "./api";

export class CVServerService {
    private static apiUrl = '/protected/cvs';

    public static async sync(CV: UserCVAttributes) {
        return await apiService.patch<void, UserCVAttributes>(
            this.apiUrl + `/${CV.id}`,
            CV
        )
    }

    public static async getCV(cvId: string) {
        return await apiService.get<UserCVAttributes>(
            this.apiUrl + `/${cvId}`
        )
    }

    public static async getCVs() {
        return await apiService.get<CVMetadataAttributes[]>(
            this.apiUrl
        )
    }

    public static async createNewCV() {
        return await apiService.post<UserCVAttributes>(
            this.apiUrl
        )
    }

    public static async createCVs(CVs: Omit<GuestCVAttributes, 'photo' | 'preview'>[]) {
        return await apiService.post<UserCVAttributes[], Omit<GuestCVAttributes, 'photo' | 'preview'>[]>(
            this.apiUrl + '/bulk',
            CVs
        )
    }

    public static async deleteCV(CVId: string) {
        return await apiService.delete<void>(
            this.apiUrl + `/${CVId}`
        )
    }
}