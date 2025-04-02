import { Request } from 'express';

export interface loginDto {
    email: string;
    password: string;   
}

export interface registerDto {
    username: string;
    email: string;
    password: string;
}

export interface GoogleUserInfo {
    id: string;
    email: string;
    name: string;
    picture?: string;
    email_verified?: boolean; // Add email verification status
  }

export interface AuthResponse{
    success: boolean;
    message: string;
    data?: {
        user: UserData
        tokens: TokenClientData
    };
}

export interface UserData { 
    id: number;
    username: string;
    email: string;
    profilePicture?: string | null;
    authProvider: 'local' | 'google';
    isActive: boolean;
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
