import { ApiResponse, ApiUserData } from "./api_interface";

export interface loginDto {
    email: string;
    password: string;
}

export interface registerDto {
    username: string;
    email: string;
    password: string;
}

export interface AuthResponseData {
    user: ApiUserData
    token: TokenClientData
}

export interface TokenClientData {
    accessToken: string;
    tokenExpiry: Date;
}

export interface AuthResponse extends ApiResponse<AuthResponseData> {}

export interface AuthStoreAttributes {
    isAuthenticated: boolean,
    isLoadingAuth: boolean,
    token: TokenClientData | null
}

export interface AuthStoreActions {
    setIsLoadingAuth: (isLoadingAuth: boolean) => void,
    setAuthState: (token: string, tokenExpiry: Date) => void
    clearAuth: () => void,
    isTokenExpired: () => boolean
}

export interface AuthStore extends AuthStoreActions, AuthStoreAttributes {}