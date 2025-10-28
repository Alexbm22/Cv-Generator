import { Request } from 'express';
import { PublicCVAttributes } from './cv';
import { User } from '../models';
import { PublicUserAttributes } from './user';
import { AuthTokenPayload, PublicTokenData } from './token';

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
    user: PublicUserAttributes
}


export enum AuthProvider {
    LOCAL = 'local',
    GOOGLE = 'google'
}

export interface AuthRequest extends Request {
    user: User;
}
