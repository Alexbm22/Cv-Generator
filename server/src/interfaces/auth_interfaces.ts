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

export interface GoogleUserInfo {
    id: string;
    email: string;
    name: string;
    picture?: string;
    email_verified?: boolean; // Add email verification status
  }

export interface AuthResponseData {
    user: UserData
    tokens: TokenClientData
}

export interface AuthResponse extends ApiResponse<AuthResponseData> {}

export interface UserData { 
    id: number;
    username: string;
    email: string;
    profilePicture?: string | null;
    authProvider: 'local' | 'google';
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
