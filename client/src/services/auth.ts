import { CredentialResponse } from "@react-oauth/google";
import { AuthResponse, loginDto, registerDto } from "../interfaces/auth";
import { apiService } from "./api";
import { UserObj } from "../interfaces/user";

export class AuthService {
    private static apiUrl = '/auth/';

    public static async googleLogin(googleResponse: CredentialResponse): Promise<AuthResponse> {
        return await apiService.post<AuthResponse, CredentialResponse>(
            this.apiUrl + 'google_login', 
            googleResponse
        ) // sending the id token to the server
    }

    public static async login(loginDto: loginDto): Promise<AuthResponse> {
        return await apiService.post<AuthResponse, loginDto>(
            this.apiUrl + 'login', 
            loginDto
        );
    }

    public static async register(registerDto: registerDto): Promise<AuthResponse> {
        return await apiService.post<AuthResponse, registerDto>(
            this.apiUrl + 'register', 
            registerDto
        );
    }

    public static async logout(userObj: UserObj): Promise<AuthResponse> {
        return await apiService.post<AuthResponse, UserObj>(
            this.apiUrl + 'logout', 
            userObj
        );
    }

    public static async checkAuth(): Promise<AuthResponse>{
        return await apiService.get<AuthResponse>(
            this.apiUrl + 'check_auth'
        );
    }
}