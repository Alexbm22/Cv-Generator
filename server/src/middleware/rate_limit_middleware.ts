import { Request, Response, NextFunction} from 'express';
import { AppError } from './error_middleware';
import rateLimit from 'express-rate-limit';

interface RateLimitConfig {
    windowMs: number;
    limit: number;
    message: string;
}

interface EnvConfig {
    [key: string]: number;
}

export class RateLimitMiddleware {

    private static ENV_CONFIG: EnvConfig = {
        DEFAULT_WINDOW_MS: process.env.RATE_LIMIT_DEFAULT_WINDOW_MS ? parseInt(process.env.RATE_LIMIT_DEFAULT_WINDOW_MS) : 15 * 60 * 1000,
        DEFAULT_LIMIT: process.env.RATE_LIMIT_DEFAULT_LIMIT ? parseInt(process.env.RATE_LIMIT_DEFAULT_LIMIT) : 100,
        AUTH_WINDOW_MS: process.env.RATE_LIMIT_AUTH_WINDOW_MS ? parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS) : 15 * 60 * 1000,
        AUTH_LIMIT: process.env.RATE_LIMIT_AUTH_LIMIT ? parseInt(process.env.RATE_LIMIT_AUTH_LIMIT) : 10,
        REFRESH_TOKEN_WINDOW_MS: process.env.RATE_LIMIT_REFRESH_TOKEN_WINDOW_MS ? parseInt(process.env.RATE_LIMIT_REFRESH_TOKEN_WINDOW_MS) : 5 * 60 * 1000,
        REFRESH_TOKEN_LIMIT: process.env.RATE_LIMIT_REFRESH_TOKEN_LIMIT ? parseInt(process.env.RATE_LIMIT_REFRESH_TOKEN_LIMIT) : 5,
    }

    static globalRateLimit = rateLimit({
        windowMs: this.ENV_CONFIG.DEFAULT_WINDOW_MS as number,
        limit: this.ENV_CONFIG.DEFAULT_LIMIT as number,
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
        windowMs: this.ENV_CONFIG.AUTH_WINDOW_MS as number,
        limit: this.ENV_CONFIG.AUTH_LIMIT as number,
        message: "Too many login attempts, try again later!"
    })

    static registerLimit = this.createRateLimit({
        windowMs: this.ENV_CONFIG.AUTH_WINDOW_MS as number,
        limit: this.ENV_CONFIG.AUTH_LIMIT as number,
        message: "Too many register attempts, try again later!"
    })

    static logoutLimit = this.createRateLimit({
        windowMs: this.ENV_CONFIG.AUTH_WINDOW_MS as number,
        limit: this.ENV_CONFIG.AUTH_LIMIT as number,
        message: "Too many logout attempts, try again later!"
    })

    static refreshTokenLimit = this.createRateLimit({
        windowMs: this.ENV_CONFIG.REFRESH_TOKEN_WINDOW_MS as number,
        limit: this.ENV_CONFIG.REFRESH_TOKEN_LIMIT as number,
        message: "Too many refresh token attempts, try again later!"
    })
}