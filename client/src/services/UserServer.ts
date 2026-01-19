import { InitialDataSyncAttributes, SyncedDataAttributes } from "../interfaces/user";
import { apiService } from "./api";

export class UserServerService {
    private static apiUrl = '/protected/user';

    public static async syncInitialData(syncData: InitialDataSyncAttributes) {
        return await apiService.post<SyncedDataAttributes, InitialDataSyncAttributes>(
            this.apiUrl + '/sync_initial_data',
            syncData
        )
    }

}