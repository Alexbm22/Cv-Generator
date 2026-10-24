import { NextFunction, Request, Response } from 'express';
import type { Feature } from '@/ai/models.catalog';
import { ErrorTypes } from '@/interfaces/error';
import { AiAccess, authorizeAiAccess } from '@/services/ai/aiUsage';
import { AppError, catchAsync } from './error_middleware';

// Rejects requests over the usage limit before any AI work. Requires req.actor to be set.
export const aiUsageGate = (feature: Feature) =>
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        if (!req.actor) {
            throw new AppError('Authentication required', 401, ErrorTypes.UNAUTHORIZED);
        }

        res.locals.aiAccess = await authorizeAiAccess(req.actor, feature);
        next();
    });

export const getAiAccess = (res: Response): AiAccess => {
    const access = res.locals.aiAccess as AiAccess | undefined;
    if (!access) {
        throw new AppError('AI access was not authorized', 500, ErrorTypes.INTERNAL_ERR);
    }
    return access;
};
