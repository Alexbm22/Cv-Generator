import { NextFunction, Request, Response } from 'express';
import { AppError } from './error_middleware';
import { AuthRequest, UserData } from '../interfaces/auth_interfaces';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
        return next(new AppError('Authorization header is missing', 401));
    }

    const accessToken = authorizationHeader.split(' ')[1];
    if (!accessToken) {
        return next(new AppError('Token is missing', 401));
    }

    const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET as string) as UserData
    if (!decodedToken) {
        return next(new AppError('Invalid token', 401));
    }

    req.user = decodedToken;

    if(!decodedToken.isActive) {
        return next(new AppError('This account is inactive. Please contact support.', 401));
    }

    next();
}