import { CredentialResponse } from "@react-oauth/google";
import { UserAttributes } from "./user";
import { MediaFilesAttributes } from "./mediaFiles";

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
    message?: string,
    token?: TokenClientData,
    user?: UserAttributes;
}

export interface TokenClientData {
    token: string;
    expiresIn: Date;
}

export interface AuthStoreAttributes {
    id: string | null;
    username: string | null;
    email: string | null;
    profilePicture: MediaFilesAttributes | string | null;
    needsInitialSync: boolean;

    isAuthenticated: boolean,
    isLoadingAuth: boolean,
    isAuthChecked: boolean,
    tokenData: TokenClientData | null
}

export interface AuthStoreActions {
    setUserData: (userData: UserAttributes) => void;
    clearAuthenticatedUser: () => void;
    getAuthenticatedUser: () => UserAttributes;
    setIsLoadingAuth: (isLoadingAuth: boolean) => void,
    setAuthChecked: (isAuthChecked: boolean) => void,
    setToken: (token: TokenClientData) => void,
    isTokenExpired: () => boolean,
    handleAuthSuccess: (authData: AuthResponse) => void;
}

export interface AuthStore extends AuthStoreActions, AuthStoreAttributes {}