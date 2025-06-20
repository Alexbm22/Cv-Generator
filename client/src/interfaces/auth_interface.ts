import { ApiResponse } from "./api_interface";
import { UserObj } from "./user_interface";

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
    user: UserObj
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
    setAuthState: (token: TokenClientData) => void
    clearAuth: () => void,
    isTokenExpired: () => boolean,
    logout: () => void,
}

export interface AuthStore extends AuthStoreActions, AuthStoreAttributes {}