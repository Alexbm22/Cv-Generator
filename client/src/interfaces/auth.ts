import { CredentialResponse } from "@react-oauth/google";
import { UserAttributes } from "./user";

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
    user: UserAttributes;
}

export interface TokenClientData {
    accessToken: string;
    tokenExpiry: Date;
}

export interface AuthStoreAttributes {
    id: string | null;
    username: string | null;
    email: string | null;
    profilePicture: string | null;

    isAuthenticated: boolean,
    isLoadingAuth: boolean,
    token: TokenClientData | null
}

export interface AuthStoreActions {
    setUserData: (userData: UserAttributes) => void;
    clearAuthenticatedUser: () => void;
    setIsLoadingAuth: (isLoadingAuth: boolean) => void,
    setToken: (token: TokenClientData) => void,
    isTokenExpired: () => boolean,
    handleAuthSuccess: (authData: AuthResponse) => void;
}

export interface AuthStore extends AuthStoreActions, AuthStoreAttributes {}