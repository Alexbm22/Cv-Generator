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
    setAuthState: (token: TokenClientData) => void
    clearAuth: () => void,
    setToken: (token: TokenClientData) => void,
    isTokenExpired: () => boolean,
    handleAuthSuccess: (authResponse: AuthResponse) => void;
    googleLogin: (googleResponse: CredentialResponse) => Promise<AuthResponse>,
    login: (loginDto: loginDto) => Promise<AuthResponse>,
    register: (registerDto: registerDto) => Promise<AuthResponse>,
    logout: () => Promise<AuthResponse>,
    forceLogout: () => void,
    checkAuth: () => Promise<AuthResponse> 
}

export interface AuthStore extends AuthStoreActions, AuthStoreAttributes {}