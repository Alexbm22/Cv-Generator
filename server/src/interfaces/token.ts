export interface TokenPayload {
    timestamp: Date;
}

export interface AuthTokenPayload extends TokenPayload {
    user_id: number,
    isFirstAuth?: boolean
    version: number;
}

export interface ValidationTokenPayload extends TokenPayload {
    userId: number;
    cvId: number;
    hash: string;
}

export type AuthTokenType = 'access' | 'refresh';

export interface PublicTokenData {
    token: string;
    expiresIn: Date;
}