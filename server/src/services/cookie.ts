import { Response } from 'express';
import { config } from '@/config/env';
import parseDuration from '@/utils/date_utils/parseDuration';
import { AuthTokenType } from '@/interfaces/token';

export class CookieService {
    private static setSecureCookie(name: string, value: string, res: Response, options?: any): void {
        res.cookie(name, value, {
            httpOnly: true,
            secure: config.NODE_ENV === 'production',
            sameSite: 'strict',
            ...options
        });
    }

    static setRefreshToken(token: string, expiration: Date, res: Response): void {
        this.setSecureCookie(AuthTokenType.REFRESH, token, res, {
            maxAge: expiration.getTime() - Date.now(),
        });
    }

    static clearRefreshToken(res: Response): void {
        res.clearCookie(AuthTokenType.REFRESH);
    }
}