import { ApiResponse, ApiUserData, TokenClientData } from "./api_interface";

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
    tokens: TokenClientData
}

export interface AuthResponse extends ApiResponse<AuthResponseData> {}