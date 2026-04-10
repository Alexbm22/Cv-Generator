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

    generateToken(user_id: number, tokenType: AuthTokenType, version: number, isFirstAuth?: boolean): PublicTokenData {
        const payload = this.generatePayload({
            user_id,
            isFirstAuth: isFirstAuth,
            version: version
        });

        const tokenSecret = tokenType === 'refresh' ? this.refreshSecret : this.secret;
        const tokenExpiration = tokenType === 'refresh' ? this.refreshExpiration : this.expiration;

        const token = jwt.sign(payload, tokenSecret as jwt.Secret, {
            expiresIn: tokenExpiration as any
        });

        return {
            token,
            expiresIn: parseDuration.parseDurationToDate(tokenExpiration)
        } as PublicTokenData;
    }

    decodeToken(token: string, tokenType: AuthTokenType) {
        const tokenSecret = tokenType === 'refresh' ? this.refreshSecret : this.secret;

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
        const tokenSecret = tokenType === 'refresh' ? this.refreshSecret : this.secret;

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

    public generateAccessToken(user_id: number, version: number, isFirstAuth?: boolean) {
        return this.generateToken(user_id, 'access', version, isFirstAuth);
    }

    public generateRefreshToken(user_id: number, version: number) {
        return this.generateToken(user_id, 'refresh', version);

    }

    public decodeAccessToken(token: string) {
        return this.decodeToken(token, 'access');
    }

    public decodeRefreshToken(token: string) {
        return this.decodeToken(token, 'refresh');
    }
}