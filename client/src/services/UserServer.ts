import { InitialDataSyncAttributes, SyncedDataAttributes, UserAccountDetails } from "../interfaces/user";
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

    public static async updateProfilePicturePreference(useAsDefault: boolean): Promise<{useProfilePictureAsDefault: boolean}> {
        return await apiService.post<{useProfilePictureAsDefault: boolean}>(
            this.apiUrl + '/preferences/profile_picture_default',
            { useAsDefault }
        );
    }

}