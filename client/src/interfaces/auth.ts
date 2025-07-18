import { CredentialResponse } from "@react-oauth/google";

export interface loginDto {
    email: string;
    password: string;
}

export interface registerDto {
    username: string;
    email: string;
    password: string;
}

export type AuthCredentials = registerDto | loginDto | CredentialResponse;

export interface AuthResponse {
    token?: TokenClientData;
    firstAuth?: boolean;
}

export interface TokenClientData {
    accessToken: string;
    tokenExpiry: Date;
}

export interface AuthStoreAttributes {
    isAuthenticated: boolean,
    isLoadingAuth: boolean,
    token: TokenClientData | null
}

export interface AuthStoreActions {
    clearAuthenticatedUser: () => void;
    setIsLoadingAuth: (isLoadingAuth: boolean) => void,
    setToken: (token: TokenClientData) => void,
    isTokenExpired: () => boolean,
    handleAuthSuccess: (token: TokenClientData) => void;
}

export interface AuthStore extends AuthStoreActions, AuthStoreAttributes {}