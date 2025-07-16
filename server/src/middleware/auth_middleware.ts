import { NextFunction, Request, Response } from 'express';
import { AppError, catchAsync } from './error_middleware';
import { AuthRequest, TokenPayload } from '../interfaces/auth';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { ErrorTypes } from '../interfaces/error';

export const authMiddleware = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction)=> {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
        return next(new AppError('Authorization header is missing', 401, ErrorTypes.UNAUTHORIZED));
    }

    const accessToken = authorizationHeader.split(' ')[1];
    if (!accessToken) {
        return next(new AppError('Token is missing', 401, ErrorTypes.UNAUTHORIZED));
    }

    let decodedToken: TokenPayload;
    try{
        decodedToken = jwt.verify(
            accessToken, 
            process.env.JWT_SECRET as string
        ) as TokenPayload;
    } catch(error: any) {
        return next(new AppError('Invalid token', 401, ErrorTypes.UNAUTHORIZED));
    }

    const user = await User.findOne({
        where: {
            id: decodedToken.id
        }
    });
    if (!user) {
        return next(new AppError('User not found', 401, ErrorTypes.UNAUTHORIZED));
    }  

    req.user = user;

    next();
});