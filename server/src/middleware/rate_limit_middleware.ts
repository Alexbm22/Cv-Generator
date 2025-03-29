import { Request, Response, NextFunction} from 'express';
import { AppError } from './error_middleware';
import rateLimit from 'express-rate-limit';

interface RateLimitConfig {
    windowMs: number;
    limit: number;
    message: string;
}

export class RateLimitMiddleware {
    static globalRateLimit = rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 100,
        message: "Too many requests from this IP, please try again later!",
        handler: (req: Request, res: Response, next: NextFunction) => {
            next(new AppError("Too many requests from this IP, please try again later!", 429));
        }
    })

    static createRateLimit = (config: RateLimitConfig) => {
        return rateLimit({
            windowMs: config.windowMs,
            limit: config.limit,
            message: config.message || "Too many requests from this IP, please try again later!",
            handler: (req: Request, res: Response, next: NextFunction) => {
                next(new AppError(config.message || 'Too many requests', 429));
            }
        })
    }

    static loginLimit = this.createRateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 100,
        message: "Too many login attempts, try again later!"
    })
}