import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    data?: any;

    constructor(message: string | undefined, statusCode: number, data?: any){
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        this.data = data;

        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
): Response | void => {
    const statusCode = "statusCode" in err ? err.statusCode : 500;
    const isOperational = "isOperational" in err ? err.isOperational : false;
    const errors = "data" in err ? err.data : undefined;
    
    if(process.env.NODE_ENV === "development"){
        return res.status(statusCode).json({
            status: "error",
            error: err,
            errorStack: err.stack,
            errorMessage: err.message,
            errors: errors,
            isOperational
        })
    }

    if(isOperational){
        return res.status(statusCode).json({
            status: "error",
            errorMessage: err.message,
            errors: errors,
        })
    } else {
        console.error("ERROR: ", err);
        return res.status(500).json({
            status: "error",
            errorMessage: "Something went wrong"
        })
    }
}

export const catchAsync = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch(next);
    }
}

export const notFound = (req: Request, res: Response, next: NextFunction) => {
    const error = new AppError(`Can't find the requested URL ${req.originalUrl}`, 404);
    next(error);
} 