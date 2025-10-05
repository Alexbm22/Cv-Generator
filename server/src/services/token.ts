import {
    TokenData,
    TokenPayload,
    PublicTokenData,
} from '../interfaces/auth';
import { User } from '../models';
import { Response, Request } from 'express';
import jwt from 'jsonwebtoken'
import { config } from '../config/env';
import { UserService } from './user';
import parseDuration from '../utils/date_utils/parseDuration';

export class TokenService {
    private readonly JWT_SECRET: string;
    private readonly JWT_REFRESH_SECRET: string;
    private readonly JWT_EXPIRATION: string;
    private readonly JWT_REFRESH_EXPIRATION: string;

    constructor() {
        this.JWT_SECRET = config.JWT_SECRET;
        this.JWT_REFRESH_SECRET = config.JWT_REFRESH_SECRET;
        this.JWT_EXPIRATION = config.JWT_EXPIRATION;
        this.JWT_REFRESH_EXPIRATION = config.JWT_REFRESH_EXPIRATION;
    }

    async setTokens(user: User, res: Response): Promise<PublicTokenData>{ // Generating and setting the tokens
        try {
            const tokens = this.generateTokens(user); // generating the access and refresh tokens
            
            // Set the refresh token in the client cookies
            this.setRefreshToken(tokens.refreshToken, res);

            const accessExpirationDate = parseDuration.parseDurationToDate(this.JWT_EXPIRATION);
            
            UserService.saveUserChanges({ refreshToken: tokens.refreshToken }, user);

            return {
                accessToken: tokens.accessToken,
                tokenExpiry: accessExpirationDate
            }
        } catch (error) {
            throw new Error("Failed to set User Tokens!");
        }
    }

    public getDecodedAccessToken(accessToken: string) { 
        try {
            return jwt.verify(
                accessToken,
                this.JWT_SECRET as string
            ) as TokenPayload;
        } catch (error) {
            return null;
        }
    }

    public getDecodedRefreshToken(req: Request): TokenPayload | null { 
        const token = req.cookies.refreshToken;
        if (!token) {
            return null;
        }

        try {
            return jwt.verify(
                token,
                this.JWT_REFRESH_SECRET as string
            ) as TokenPayload;
        } catch (error) {
            return null;
        }
    }

    public generateTokenPayload(user: User): TokenPayload {
        return {
            id: user.get().id
        };
    }

    public generateAccessToken(user: User): PublicTokenData {
        const payload = this.generateTokenPayload(user);
        const accessToken = jwt.sign(payload, this.JWT_SECRET as jwt.Secret, {
            expiresIn: this.JWT_EXPIRATION as any
        });

        const accessExpirationDate = parseDuration.parseDurationToDate(this.JWT_EXPIRATION);

        return {
            accessToken,
            tokenExpiry: accessExpirationDate
        };
    }

    public generateTokens(user: User): TokenData {
        const payload = this.generateTokenPayload(user);

        const accessToken = jwt.sign(payload, this.JWT_SECRET as jwt.Secret, {
            expiresIn: this.JWT_EXPIRATION as any
        })

        const refreshToken = jwt.sign(payload, this.JWT_REFRESH_SECRET as jwt.Secret, {
            expiresIn: this.JWT_REFRESH_EXPIRATION as any
        })

        return {
            accessToken,
            refreshToken
        }
    }

    public setRefreshToken(token: string, res: Response): void{
        res.cookie('refreshToken', token, {
            httpOnly: true,
            secure: config.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: parseDuration.parseDurationToSeconds(this.JWT_REFRESH_EXPIRATION) * 1000,
        })
    }

    public clearRefreshToken(res: Response) {
        res.clearCookie('refreshToken')
    }
}