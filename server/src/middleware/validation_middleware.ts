import { NextFunction, Request, Response } from 'express';
import { ValidationChain, validationResult } from 'express-validator';
import { ErrorTypes } from '../interfaces/error'; 
import { AppError } from './error_middleware';

export const Validate = (origin: string, validations : ValidationChain[]) => {
    return [
        ...validations,
        (req: Request, res: Response, next: NextFunction): void => {
            try {
                const errors = validationResult(req);
                if(!errors.isEmpty()) {
                    const Errors = errors.array().map((err) => {
                        const error = err as any;
                        return {
                            message: error.msg,
                            param: error.path || error.param || error.field || error.location,
                            formOrigin: origin
                        }
                    })
                    return next(new AppError(`${origin} Form Validation Error`, 400, ErrorTypes.VALIDATION_ERR,Errors));
                }
                next();
            } catch (error) {
                next(error);
            }
        },
    ]
}