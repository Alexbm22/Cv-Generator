import {
    TokenData,
    TokenPayload,
    TokenClientData,
} from '../interfaces/auth_interfaces';
import { User } from '../models';
import { Response, Request } from 'express';
import jwt from 'jsonwebtoken'

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

    async setTokens(user: User, res: Response): Promise<TokenClientData>{ // Generating and setting the tokens
        const tokens = this.generateTokens(user); // generating the access and refresh tokens
        
        // Set the refresh token in the client cookies
        this.setRefreshToken(tokens.refreshToken, res);
        
        const accessExpirationDate = this.getExpirationDate(this.JWT_EXPIRATION);
        
        await User.update({
            refreshToken: tokens.refreshToken,
        }, {
            where: { 
                id: user.id
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

    public generateTokens(user: User): TokenData {
        const payload = {
            id: user.get('id') ? user.get('id') : user.id,
        } as TokenPayload

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
            maxAge: this.getExpirationInSeconds(this.JWT_REFRESH_EXPIRATION) * 1000,
        })
    }

    public getExpirationInSeconds(expiration: string | number): number {
        if (typeof expiration === 'number') return expiration;
        
        // Parse string like '1h', '7d', etc.
        const match = expiration.match(/^(\d+)([smhd])$/);
        if (!match) return 3600; // Default to 1 hour
        
        const value = parseInt(match[1]);
        const unit = match[2];
        
        switch (unit) {
          case 's': return value;
          case 'm': return value * 60;
          case 'h': return value * 60 * 60;
          case 'd': return value * 24 * 60 * 60;
          default: return 3600;
        }
    }

    public getExpirationDate(expiration: string): Date {
        const expiresIn = this.getExpirationInSeconds(expiration);
        return new Date(Date.now() + expiresIn * 1000);
    }
}