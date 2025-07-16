import { Request } from 'express';
import { PublicCVAttributes } from './cv';
import { User } from '../models';

export interface loginDto {
    email: string;
    password: string;
    CVs?: PublicCVAttributes[]   
}

export interface registerDto {
    username: string;
    email: string;
    password: string;
    CVs?: PublicCVAttributes[]
}

export interface GoogleUserPayload {
    google_id: string;
    given_name: string;
    family_name: string;
    picture?: string;
    email: string;
    email_verified?: boolean; 
}

export interface AuthResponse {
    token?: PublicTokenData,
    firstAuth?: boolean, 
}


export enum AuthProvider {
    LOCAL = 'local',
    GOOGLE = 'google'
}

export interface TokenPayload {
    id: number;
    exp?: number;
}

export interface PublicTokenData {
    accessToken: string;
    tokenExpiry: Date;
}

export interface TokenData {
    accessToken: string;
    refreshToken: string;
}

export interface AuthRequest extends Request {
    user: User;
}
