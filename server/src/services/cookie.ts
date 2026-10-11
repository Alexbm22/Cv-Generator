import { Response } from 'express';
import { config } from '@/config/env';

export const REFRESH_COOKIE_NAME = 'refresh';

const refreshCookieOptions = {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
};

export class CookieService {
    static setRefreshToken(token: string, expiration: Date, res: Response): void {
        res.cookie(REFRESH_COOKIE_NAME, token, {
            ...refreshCookieOptions,
            maxAge: expiration.getTime() - Date.now(),
        });
    }

    static clearRefreshToken(res: Response): void {
        res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions);
    }
}