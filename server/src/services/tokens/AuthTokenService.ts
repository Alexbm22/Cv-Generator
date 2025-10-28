import { config } from '@/config/env';
import { BaseTokenService } from "./BaseTokenService";
import jwt from 'jsonwebtoken'
import parseDuration from '@/utils/date_utils/parseDuration';
import { AuthTokenPayload, AuthTokenType, PublicTokenData } from '@/interfaces/token';

export class AuthTokenService extends BaseTokenService {
    protected readonly secret: string;
    protected readonly expiration: string;
    private readonly refreshSecret: string;
    private readonly refreshExpiration: string;

    constructor() {
        super();
        this.secret = config.JWT_SECRET;
        this.expiration = config.JWT_EXPIRATION;
        this.refreshSecret = config.JWT_REFRESH_SECRET;
        this.refreshExpiration = config.JWT_REFRESH_EXPIRATION;
    }

    generateToken(user_id: number, tokenType: AuthTokenType, isFirstAuth?: boolean) {
        const payload = this.generatePayload({
            user_id,
            isFirstAuth: isFirstAuth
        });

        const tokenSecret = tokenType === AuthTokenType.REFRESH ? this.refreshSecret : this.secret;
        const tokenExpiration = tokenType === AuthTokenType.REFRESH ? this.refreshExpiration : this.expiration;

        const token = jwt.sign(payload, tokenSecret as jwt.Secret, {
            expiresIn: tokenExpiration as any
        });

        return {
            token,
            expiresIn: parseDuration.parseDurationToDate(tokenExpiration)
        } as PublicTokenData;
    }

    decodeToken(token: string, tokenType: AuthTokenType) {
        const tokenSecret = tokenType === AuthTokenType.REFRESH ? this.refreshSecret : this.secret;

        try {
            return jwt.verify(
                token, 
                tokenSecret as jwt.Secret
            ) as AuthTokenPayload;
        } catch (error) {
            return null;
        }
    }

    verifyToken(token: string, tokenType: AuthTokenType): boolean {
        const tokenSecret = tokenType === AuthTokenType.REFRESH ? this.refreshSecret : this.secret;

        try {
            jwt.verify(
                token,
                tokenSecret as jwt.Secret
            );
            return true;
        } catch (error) {
            return false;
        }
    }

    public generateAccessToken(user_id: number, isFirstAuth?: boolean) {
        return this.generateToken(user_id, AuthTokenType.ACCESS, isFirstAuth);
    }

    public generateRefreshToken(user_id: number) {
        return this.generateToken(user_id, AuthTokenType.REFRESH);
    }

    public decodeAccessToken(token: string) {
        return this.decodeToken(token, AuthTokenType.ACCESS);
    }

    public decodeRefreshToken(token: string) {
        return this.decodeToken(token, AuthTokenType.REFRESH);
    }
}