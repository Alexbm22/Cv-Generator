import { InitialDataSyncAttributes, SyncedDataAttributes, UserAccountDetails, UserPreferences } from "../interfaces/user";
import { apiService } from "./api";

export class UserServerService {
    private static apiUrl = '/protected/user';

    public static async syncInitialData(syncData: InitialDataSyncAttributes) {
        return await apiService.post<SyncedDataAttributes, InitialDataSyncAttributes>(
            this.apiUrl + '/sync_initial_data',
            syncData
        )
    }

    public static async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
        return await apiService.post<void>(this.apiUrl + '/change_password', data);
    }
    
    public static async getAccountData() {
        return await apiService.get<UserAccountDetails>(
            this.apiUrl + '/account',
        )
    }

    public static async updateProfilePicturePreference(useAsDefault: boolean): Promise<void> {
        return await apiService.post<void>(
            this.apiUrl + '/preferences/profile_picture_default',
            { useAsDefault }
        );
    }

    public static async getUserPreferences(): Promise<UserPreferences> {
        return await apiService.get<UserPreferences>(
            this.apiUrl + '/preferences',
        )
    }

    public static async updateCustomColors(customColors: string[]): Promise<void> {
        return await apiService.post<void>(
            this.apiUrl + '/preferences/custom_colors',
            { customColors }
        );
    }

}