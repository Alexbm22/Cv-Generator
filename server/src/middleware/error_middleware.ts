import { config } from '../config/env';
import { ErrorTypes } from '../interfaces/error';
import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly errorType: ErrorTypes
    public readonly data?: any;

    constructor(message: string, statusCode: number, errorType: ErrorTypes, data?: any){
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        this.data = data;
        this.errorType = errorType

        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
): Response | void => {
    const statusCode = err.statusCode ?? 500;
    const isOperational = err.isOperational ?? false;
    const errType = err.errorType ?? ErrorTypes.INTERNAL_ERR;
    const errors = err.data ?? undefined;
    
    if(config.NODE_ENV === "development"){
        return res.status(statusCode).json({
            message: err.message,
            stack: err.stack,
            errors,
            errType,
            isOperational
        })
    }

    if(isOperational){
        return res.status(statusCode).json({
            message: err.message,
            errors: errors,
            errType,
        })
    } else {
        console.error("ERROR: ", err);
        return res.status(500).json({
            message: "Something went wrong",
            errType: ErrorTypes.INTERNAL_ERR,
        })
    }
}

export const catchAsync = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch(next);
    }
}

export const notFound = (req: Request, res: Response, next: NextFunction) => {
    const error = new AppError(`Can't find the requested URL ${req.originalUrl}`, 404, ErrorTypes.NOT_FOUND);
    next(error);
} 