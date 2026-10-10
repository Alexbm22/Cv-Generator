import { NextFunction, Request, Response } from 'express';
import { config, passwordActionConfig } from '@/config/env';
import { ErrorTypes } from '@/interfaces/error';
import { PasswordActionExchangeRequest, PasswordActionRequest } from '@/interfaces/passwordAction';
import { PasswordActionSession, PasswordActionToken, User } from '@/models';
import { AppError } from './error_middleware';
import { PasswordActionError, PasswordActionFailureReason } from '@/services/passwordAction';
import { PasswordActionSessionService } from '@/services/passwordAction/PasswordActionSessionService';
import { AuthTokenService } from '@/services/tokens';
import { UserService } from '@/services/user';
import { PasswordActionLogger } from '@/services/passwordAction/PasswordActionLogger';

const invalidSessionError = () => new AppError(
    'Invalid password action session.',
    401,
    ErrorTypes.UNAUTHORIZED,
    { code: 'INVALID_SESSION' },
);

const passwordActionCookieOptions = {
    httpOnly: true,
    secure: config.NODE_ENV !== 'development',
    sameSite: 'lax' as const,
    path: passwordActionConfig.cookiePath,
};

export const setPasswordActionCookie = (res: Response, secret: string, expiresAt: Date): void => {
    res.cookie(passwordActionConfig.cookieName, secret, {
        ...passwordActionCookieOptions,
        expires: expiresAt,
        maxAge: Math.max(0, expiresAt.getTime() - Date.now()),
    });
};

export const clearPasswordActionCookie = (res: Response): void => {
    res.clearCookie(passwordActionConfig.cookieName, passwordActionCookieOptions);
};

export const noStore = (_req: Request, res: Response, next: NextFunction): void => {
    res.setHeader('Cache-Control', 'no-store');
    next();
};

export const passwordActionOriginCheck = (req: Request, _res: Response, next: NextFunction): void => {
    if (req.get('origin') !== config.ORIGIN) {
        return next(new AppError('Forbidden.', 403, ErrorTypes.UNAUTHORIZED));
    }
    next();
};

export const optionalPasswordActionAuth = async (
    req: PasswordActionExchangeRequest,
    _res: Response,
    next: NextFunction,
): Promise<void> => {
    const authorization = req.get('authorization');
    const match = authorization?.match(/^Bearer\s+(.+)$/i);
    if (!match) {
        next();
        return;
    }

    const decoded = new AuthTokenService().decodeAccessToken(match[1]);
    if (!decoded) {
        next();
        return;
    }

    try {
        const user = await UserService.getUser({ id: decoded.user_id, tokenVersion: decoded.version });
        if (user) req.authenticatedUserId = user.get('id');
        next();
    } catch (error) {
        next(error);
    }
};

export const requirePasswordActionSession = async (
    req: PasswordActionRequest,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    const secret = req.cookies?.[passwordActionConfig.cookieName];
    if (typeof secret !== 'string') {
        clearPasswordActionCookie(res);
        if (req.method === 'POST' && req.path === '/actions/complete') {
            void PasswordActionLogger.append({
                event: 'password.complete.failed',
                userId: null,
                type: null,
                ip: req.ip ?? '',
                reason: PasswordActionFailureReason.MALFORMED,
            });
        }
        next(invalidSessionError());
        return;
    }

    try {
        const validated = await PasswordActionSessionService.validate(secret);
        const [session, token, user] = await Promise.all([
            PasswordActionSession.findByPk(validated.sessionId),
            PasswordActionToken.findByPk(validated.tokenId),
            User.findByPk(validated.userId),
        ]);
        if (!session || !token || !user) {
            throw new PasswordActionError('INVALID_SESSION', PasswordActionFailureReason.NOT_FOUND);
        }
        req.passwordAction = { session, token, user };
        next();
    } catch (error) {
        clearPasswordActionCookie(res);
        if (error instanceof PasswordActionError) {
            if (req.method === 'POST' && req.path === '/actions/complete') {
                void PasswordActionLogger.append({
                    event: 'password.complete.failed',
                    userId: null,
                    type: null,
                    ip: req.ip ?? '',
                    reason: error.reason,
                });
            }
            next(invalidSessionError());
            return;
        }
        next(error);
    }
};
