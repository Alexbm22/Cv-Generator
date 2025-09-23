import { CredentialResponse } from "@react-oauth/google";
import { AuthResponse, loginDto, registerDto, TokenClientData } from "../interfaces/auth";
import { apiService } from "./api";
import { useAuthStore, useCVsStore } from "../Store";
import { routes } from "../router/routes";

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

    public static async logout(): Promise<void> {
        return await apiService.post<void>(
            this.apiUrl + 'logout'
        );
    }

    public static async checkAuth(): Promise<TokenClientData>{
        return await apiService.get<TokenClientData>(
            this.apiUrl + 'check_auth'
        );
    }

    public static async forceLogout(): Promise<void> {
        await this.logout();
        useAuthStore.getState().clearAuthenticatedUser();
        useCVsStore.getState().clearCVsData()

        if(window.location !== undefined){
            window.location.href = routes.login.path; // Redirect to login page
        }
    }
}