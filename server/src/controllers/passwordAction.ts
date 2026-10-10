import { NextFunction, Request, Response } from 'express';
import { AuthRequest } from '@/interfaces/auth';
import {
    PasswordActionContext,
    PasswordActionExchangeRequest,
    PasswordActionRequest,
    PasswordActionType,
} from '@/interfaces/passwordAction';
import { ErrorTypes } from '@/interfaces/error';
import { AppError } from '@/middleware/error_middleware';
import {
    clearPasswordActionCookie,
    setPasswordActionCookie,
} from '@/middleware/password_action_middleware';
import {
    PasswordActionLogger,
    PasswordActionLogReason,
} from '@/services/passwordAction/PasswordActionLogger';
import {
    PasswordActionError,
} from '@/services/passwordAction/PasswordActionError';
import { PasswordActionService, CompletePasswordActionInput } from '@/services/passwordAction/PasswordActionService';
import { PasswordActionSessionService } from '@/services/passwordAction/PasswordActionSessionService';
import { PasswordActionTokenService } from '@/services/passwordAction/PasswordActionTokenService';

const passwordActionService = new PasswordActionService();
const genericForgotResponse = { message: 'If an account exists, password instructions will be sent.' };

const getContext = (req: PasswordActionRequest, next: NextFunction): PasswordActionContext | null => {
    if (req.passwordAction) return req.passwordAction;
    next(new AppError('Invalid password action session.', 401, ErrorTypes.UNAUTHORIZED, {
        code: 'INVALID_SESSION',
    }));
    return null;
};

const getFailureReason = (error: unknown): PasswordActionLogReason => {
    if (error instanceof PasswordActionError) return error.reason;
    if (error instanceof AppError) {
        const code = (error.data as { code?: unknown } | undefined)?.code;
        if (typeof code === 'string') {
            const reasons: Record<string, PasswordActionLogReason> = {
                INVALID_PASSWORD: 'INVALID_PASSWORD',
                INVALID_CURRENT_PASSWORD: 'INVALID_CURRENT_PASSWORD',
                SAME_PASSWORD: 'SAME_PASSWORD',
                ALREADY_HAS_PASSWORD: 'ALREADY_HAS_PASSWORD',
                NO_PASSWORD_SET: 'NO_PASSWORD_SET',
            };
            return reasons[code] ?? 'INTERNAL_ERROR';
        }
    }
    return 'INTERNAL_ERROR';
};

export class PasswordActionController {
    static async forgot(req: Request, res: Response): Promise<void> {
        const email = req.body.email as string;
        const ip = req.ip ?? '';
        res.status(200).json(genericForgotResponse);
        void passwordActionService.requestReset(email, ip);
    }

    static async requestChange(req: Request, res: Response, next: NextFunction): Promise<void> {
        const user = (req as AuthRequest).user;
        try {
            await passwordActionService.requestAction(PasswordActionType.CHANGE_PASSWORD, user, req.ip ?? '');
            res.status(204).end();
        } catch (error) {
            next(error);
        }
    }

    static async requestSet(req: Request, res: Response, next: NextFunction): Promise<void> {
        const user = (req as AuthRequest).user;
        try {
            await passwordActionService.requestAction(PasswordActionType.SET_PASSWORD, user, req.ip ?? '');
            res.status(204).end();
        } catch (error) {
            next(error);
        }
    }

    static async exchange(req: Request, res: Response, next: NextFunction): Promise<void> {
        const input = req.body as { token?: unknown };
        const authenticatedUserId = (req as PasswordActionExchangeRequest).authenticatedUserId;
        try {
            const exchanged = await PasswordActionTokenService.exchange(input?.token, { authenticatedUserId });
            setPasswordActionCookie(res, exchanged.sessionSecret, exchanged.expiresAt);
            await PasswordActionLogger.append({
                event: 'password.exchange.ok',
                userId: exchanged.userId,
                type: exchanged.type,
                ip: req.ip ?? '',
                reason: null,
            });
            res.status(200).json({ type: exchanged.type });
        } catch (error) {
            if (error instanceof PasswordActionError) {
                await PasswordActionLogger.append({
                    event: 'password.exchange.failed',
                    userId: null,
                    type: null,
                    ip: req.ip ?? '',
                    reason: error.reason,
                });
                next(new PasswordActionError('INVALID_TOKEN', error.reason));
                return;
            }
            next(error);
        }
    }

    static async session(req: Request, res: Response, next: NextFunction): Promise<void> {
        const context = getContext(req as PasswordActionRequest, next);
        if (!context) return;
        res.status(200).json({ type: context.token.get('type'), expiresAt: context.session.get('expiresAt') });
    }

    static async complete(req: Request, res: Response, next: NextFunction): Promise<void> {
        const context = getContext(req as PasswordActionRequest, next);
        if (!context) return;
        try {
            await passwordActionService.complete(
                context,
                req.body as CompletePasswordActionInput,
                req.ip ?? '',
            );
            clearPasswordActionCookie(res);
            res.status(204).end();
        } catch (error) {
            await PasswordActionLogger.append({
                event: 'password.complete.failed',
                userId: context.user.get('id'),
                type: context.token.get('type'),
                ip: req.ip ?? '',
                reason: getFailureReason(error),
            });
            next(error);
        }
    }

    static async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
        const context = getContext(req as PasswordActionRequest, next);
        if (!context) return;
        try {
            await PasswordActionSessionService.revoke(context.session.get('id'));
            clearPasswordActionCookie(res);
            res.status(204).end();
        } catch (error) {
            if (error instanceof PasswordActionError) {
                next(new AppError('Invalid password action session.', 401, ErrorTypes.UNAUTHORIZED, {
                    code: 'INVALID_SESSION',
                }));
                return;
            }
            next(error);
        }
    }
}
