import express, { NextFunction, Request, Response } from 'express';
import { AuthRequest } from '@/interfaces/auth';
import { PasswordActionExchangeRequest, PasswordActionRequest } from '@/interfaces/passwordAction';
import { PasswordActionController } from '@/controllers/passwordAction';
import { authMiddleware } from '@/middleware/auth_middleware';
import { catchAsync } from '@/middleware/error_middleware';
import {
    optionalPasswordActionAuth,
    passwordActionOriginCheck,
    requirePasswordActionSession,
} from '@/middleware/password_action_middleware';
import RateLimitInstance from '@/middleware/rate_limit_middleware';
import { Validate } from '@/middleware/validation_middleware';
import { completePasswordActionRules, forgotPasswordRules } from '@/validators/password_validators';

const router = express.Router();
const windowMs = 15 * 60 * 1000;
const routeHandler = (
    handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) => catchAsync(async (req: Request, res: Response, next: NextFunction) => handler(req, res, next));

const changeByUserLimit = RateLimitInstance.keyedLimit(windowMs, 3, req => {
    const userId = (req as AuthRequest).user?.id;
    return `user:${userId ?? 'unknown'}`;
});
const setByUserLimit = RateLimitInstance.keyedLimit(windowMs, 3, req => {
    const userId = (req as AuthRequest).user?.id;
    return `user:${userId ?? 'unknown'}`;
});
const forgotByEmailLimit = RateLimitInstance.keyedLimit(windowMs, 5, req => {
    const email = req.body?.email;
    return `email:${typeof email === 'string' ? email.trim().toLowerCase() : 'invalid'}`;
});
const completeBySessionLimit = RateLimitInstance.keyedLimit(windowMs, 5, req => {
    const sessionId = (req as PasswordActionRequest).passwordAction?.session.id;
    return `session:${sessionId ?? 'unknown'}`;
});

router.post(
    '/forgot',
    RateLimitInstance.limit(windowMs, 5),
    Validate('forgot password', forgotPasswordRules),
    forgotByEmailLimit,
    routeHandler(PasswordActionController.forgot),
);

router.post(
    '/change/request',
    authMiddleware,
    changeByUserLimit,
    routeHandler(PasswordActionController.requestChange),
);

router.post(
    '/set/request',
    authMiddleware,
    setByUserLimit,
    routeHandler(PasswordActionController.requestSet),
);

router.post(
    '/actions/exchange',
    passwordActionOriginCheck,
    RateLimitInstance.limit(windowMs, 10),
    optionalPasswordActionAuth as (req: Request, res: Response, next: NextFunction) => void,
    routeHandler(PasswordActionController.exchange),
);

router.get(
    '/actions/session',
    requirePasswordActionSession as (req: Request, res: Response, next: NextFunction) => void,
    routeHandler(PasswordActionController.session),
);

router.post(
    '/actions/complete',
    passwordActionOriginCheck,
    RateLimitInstance.limit(windowMs, 5),
    requirePasswordActionSession as (req: Request, res: Response, next: NextFunction) => void,
    completeBySessionLimit,
    Validate('complete password action', completePasswordActionRules),
    routeHandler(PasswordActionController.complete),
);

router.post(
    '/actions/cancel',
    passwordActionOriginCheck,
    requirePasswordActionSession as (req: Request, res: Response, next: NextFunction) => void,
    routeHandler(PasswordActionController.cancel),
);

export default router;
