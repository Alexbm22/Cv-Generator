import { Response } from 'express';
import { config } from '@/config/env';

export const REFRESH_COOKIE_NAME = 'refresh';
export const GUEST_COOKIE_NAME = 'gid';

const DAY_MS = 24 * 60 * 60 * 1000;

const refreshCookieOptions = {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
};

// Lax (not strict) so the guest identity is still sent on same-site navigations to the app.
const guestCookieOptions = {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'lax' as const,
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

    static setGuestToken(token: string, res: Response): void {
        res.cookie(GUEST_COOKIE_NAME, token, {
            ...guestCookieOptions,
            maxAge: config.GUEST_COOKIE_MAX_AGE_DAYS * DAY_MS,
        });
    }

    static clearGuestToken(res: Response): void {
        res.clearCookie(GUEST_COOKIE_NAME, guestCookieOptions);
    }
}