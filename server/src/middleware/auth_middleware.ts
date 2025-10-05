import { NextFunction, Request, Response } from 'express';
import { AppError, catchAsync } from './error_middleware';
import { AuthRequest } from '../interfaces/auth';
import { ErrorTypes } from '../interfaces/error';
import { TokenService } from '@/services/token';
import { UserService } from '@/services/user';

const tokenService = new TokenService();

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

        const decodedAccessToken = tokenService.getDecodedAccessToken(accessToken);
        if(!decodedAccessToken) {
            throw new AppError('Invalid token', 401, ErrorTypes.UNAUTHORIZED);
        }

        const user = await UserService.findUser({ id: decodedAccessToken.id });
        if (!user) {
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