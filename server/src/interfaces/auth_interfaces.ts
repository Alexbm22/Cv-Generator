import { Request } from 'express';
import { ClientCVAttributes } from './cv_interface';
import { ApiResponse } from './api_interface';

export interface loginDto {
    email: string;
    password: string;
    CVs?: ClientCVAttributes[]   
}

export interface registerDto {
    username: string;
    email: string;
    password: string;
    CVs?: ClientCVAttributes[]
}

export interface GoogleUserPayload {
    google_id: string;
    given_name: string;
    family_name: string;
    picture?: string;
    email: string;
    email_verified?: boolean; 
}

export interface AuthResponseData {
    user: UserData
    token: TokenClientData
}

export interface AuthResponse extends ApiResponse<AuthResponseData> {}

export enum AuthProvider {
    LOCAL = 'local',
    GOOGLE = 'google'
}

export interface UserData { 
    id: number;
    username: string;
    email: string;
    profilePicture?: string | null;
    authProvider: AuthProvider;
    isActive: boolean;
}

export interface TokenPayload {
    id: number;
    exp?: number;
}

export interface TokenClientData {
    accessToken: string;
    expiresIn: Date;
}

export interface TokenData {
    accessToken: string;
    refreshToken: string;
}

export interface AuthRequest extends Request {
    user?: UserData;
}
