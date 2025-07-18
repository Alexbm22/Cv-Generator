import {
    TokenData,
    TokenPayload,
    PublicTokenData,
} from '../interfaces/auth';
import { User } from '../models';
import { Response, Request } from 'express';
import jwt from 'jsonwebtoken'
import { parseDurationToSeconds } from '../utils/date_utils/parseDurationToSeconds';

export class TokenServices {
    private readonly JWT_SECRET: string;
    private readonly JWT_REFRESH_SECRET: string;
    private readonly JWT_EXPIRATION: string;
    private readonly JWT_REFRESH_EXPIRATION: string;

    constructor() {
        this.JWT_SECRET = process.env.JWT_SECRET || 'secret';
        this.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret';
        this.JWT_EXPIRATION = process.env.JWT_EXPIRATION || '1h';
        this.JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || '7d';
    }

    async setTokens(user: User, res: Response): Promise<PublicTokenData>{ // Generating and setting the tokens
        const tokens = this.generateTokens(user); // generating the access and refresh tokens
        
        // Set the refresh token in the client cookies
        this.setRefreshToken(tokens.refreshToken, res);

        const accessExpirationDate = this.getExpirationDate(this.JWT_EXPIRATION);
        
        await User.update({
            refreshToken: tokens.refreshToken,
        }, {
            where: { 
                id: user.get('id') ? user.get('id') : user.id
            },
        })

        return {
            accessToken: tokens.accessToken,
            tokenExpiry: accessExpirationDate
        }
    }

    public getDecodedToken(req: Request): TokenPayload | null { 
        const token = req.cookies.refreshToken;
        if (!token) {
            return null;
        }

        let decodedToken: TokenPayload;
        try {
            decodedToken = jwt.verify(
                token,
                this.JWT_REFRESH_SECRET as string
            ) as TokenPayload;
        } catch (error) {
            return null;
        }

        return decodedToken;
    }

    public generateTokenPayload(user: User): TokenPayload {
        return {
            id: user.get('id') ? user.get('id') : user.id,
        };
    }

    public generateAccessToken(user: User): PublicTokenData {
        const payload = this.generateTokenPayload(user);
        const accessToken = jwt.sign(payload, this.JWT_SECRET as jwt.Secret, {
            expiresIn: this.JWT_EXPIRATION as any
        });

        const accessExpirationDate = this.getExpirationDate(this.JWT_EXPIRATION);

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
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: parseDurationToSeconds(this.JWT_REFRESH_EXPIRATION) * 1000,
        })
    }

    public getExpirationDate(expiration: string): Date {
        const expiresIn = parseDurationToSeconds(expiration);
        return new Date(Date.now() + expiresIn * 1000);
    }
}