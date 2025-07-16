import { UserProfile } from "../interfaces/user";
import { apiService } from "./api";

export class UserServices {
    private static apiUrl = '/protected/user';

    static async fetchUserProfile() {
        return await apiService.get<UserProfile>(
            this.apiUrl + '/profile'
        )
    }
}