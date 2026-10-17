import { NextFunction, Request, Response } from 'express';
import { AppError, catchAsync } from './error_middleware';
import { AuthRequest } from '../interfaces/auth';
import { ErrorTypes } from '../interfaces/error';
import { UserService } from '@/services/user';
import { AuthTokenService } from '@/services/tokens';
import { toRegisteredActor } from './actor';

const tokenService = new AuthTokenService();

export const authMiddleware = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    
    try {

        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            throw new AppError('Authorization header is missing', 401, ErrorTypes.UNAUTHORIZED);
        }
    
        const accessToken = authorizationHeader.split(' ')[1];
        if (!accessToken) {
            throw new AppError('Token is missing', 401, ErrorTypes.UNAUTHORIZED);
        }

        const decodedAccessToken = tokenService.decodeAccessToken(accessToken);
        if(!decodedAccessToken) {
            throw new AppError('Invalid token', 401, ErrorTypes.UNAUTHORIZED);
        }

        let user = await UserService.getUser({ id: decodedAccessToken.user_id, tokenVersion: decodedAccessToken.version });
        if (!user && decodedAccessToken.isFirstAuth) {
            // Wait for a short duration before retrying
            await new Promise(resolve => setTimeout(resolve, 300));
            user = await UserService.getUser({ id: decodedAccessToken.user_id, tokenVersion: decodedAccessToken.version });
        }
        if (!user) {
            throw new AppError('User not found', 401, ErrorTypes.UNAUTHORIZED);
        }

        const actor = toRegisteredActor(user);
        if (!actor) {
            throw new AppError('User not found', 401, ErrorTypes.UNAUTHORIZED);
        }

        req.user = user;
        req.actor = actor;
    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        } else {
            // Unexpected errors
            return next(new AppError('Auth Failed', 500, ErrorTypes.INTERNAL_ERR, error));
        }
    }

    next();
});