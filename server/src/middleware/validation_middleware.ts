import { NextFunction, Request, Response } from 'express';
import { ValidationChain, validationResult } from 'express-validator';
import { AppError } from './error_middleware';

export const Validate = (validations : ValidationChain[]) => {
    return [
        ...validations,
        (req: Request, res: Response, next: NextFunction): void => {
            try {
                const errors = validationResult(req);
                if(!errors.isEmpty()) {
                    const Errors = errors.array().map((err) => {
                        const error = err as any;
                        return {
                            errorMsg: error.msg,
                            param: error.path || error.param || error.field || error.location
                        }
                    })
                    return next(new AppError("Validation Error", 400, Errors));
                }
                next();
            } catch (error) {
                next(error);
            }
        },
    ]
}