import { NextFunction, Request, Response } from 'express';
import { AppError, catchAsync } from './error_middleware';
import { AuthRequest } from '../interfaces/auth';
import { ErrorTypes } from '../interfaces/error';
import { UserService } from '@/services/user';
import { AuthTokenService } from '@/services/tokens';

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

        const user = await UserService.getUser({ id: decodedAccessToken.user_id });
        if (!user) {
            if (decodedAccessToken.isFirstAuth) {
                // Wait for a short duration before retrying
                await new Promise(resolve => setTimeout(resolve, 300));
                const retryUser = await UserService.getUser({ id: decodedAccessToken.user_id });
                if (retryUser) {
                    req.user = retryUser;
                    return next();
                }
            }
            return next(new AppError('User not found', 401, ErrorTypes.UNAUTHORIZED));
        }  
    
        req.user = user;
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