import { NextFunction, Request, Response } from 'express';
import { AppError, catchAsync } from './error_middleware';
import { AuthRequest, TokenPayload, UserData } from '../interfaces/auth_interfaces';
import jwt from 'jsonwebtoken';
import { User } from '../models';

export const authMiddleware = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction)=> {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
        return next(new AppError('Authorization header is missing', 401));
    }

    const accessToken = authorizationHeader.split(' ')[1];
    if (!accessToken) {
        return next(new AppError('Token is missing', 401));
    }

    let decodedToken: TokenPayload;
    try{
        decodedToken = jwt.verify(
            accessToken, 
            process.env.JWT_SECRET as string
        ) as TokenPayload;
    } catch(error: any) {
        return next(new AppError('Invalid token', 401));
    }

    const user = await User.findOne({
        where: {
            id: decodedToken.id
        }
    });
    if (!user) {
        return next(new AppError('User not found', 401));
    }   

    req.user = user.get() as UserData;

    next();
});