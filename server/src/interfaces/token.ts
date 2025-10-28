export interface TokenPayload {
    timestamp: Date;
}

export interface AuthTokenPayload extends TokenPayload {
    user_id: number,
    isFirstAuth?: boolean
}

export interface ValidationTokenPayload extends TokenPayload {
    userId: number;
    cvId: number;
    hash: string;
}

export enum AuthTokenType {
    ACCESS = 'accessToken',
    REFRESH = 'refreshToken'
}

export interface PublicTokenData {
    token: string;
    expiresIn: Date;
}