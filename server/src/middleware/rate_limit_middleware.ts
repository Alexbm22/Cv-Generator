import { Request, Response, NextFunction} from 'express';
import { AppError } from './error_middleware';
import rateLimit from 'express-rate-limit';
import { ErrorTypes } from '../interfaces/error';
import { config, Env } from '../config/env';

interface EnvConfig {
    [key: string]: number;
}

interface RateLimitConfig {
  windowMs: number;
  limit: number;
  message?: string;
}

interface RateLimitEnvironmentConfig {
  DEFAULT_LIMIT: number;
  DEFAULT_WINDOW_MS: number;
  AUTH_WINDOW_MS: number;
  AUTH_LIMIT: number;
  REFRESH_TOKEN_WINDOW_MS: number;
  REFRESH_TOKEN_LIMIT: number;
  CHECK_AUTH_WINDOW_MS: number;
  CHECK_AUTH_LIMIT: number;
  CVS_WINDOW_MS: number;
  CVS_LIMIT: number;
}

export class RateLimitMiddleware {
  private readonly config: RateLimitEnvironmentConfig;

  constructor() {
    this.config = this.loadEnvironmentConfig();
  }

  private loadEnvironmentConfig(): RateLimitEnvironmentConfig {

    return {
      DEFAULT_LIMIT: config.RATE_LIMIT_DEFAULT_LIMIT,
      DEFAULT_WINDOW_MS: config.RATE_LIMIT_DEFAULT_WINDOW_MS,
      AUTH_WINDOW_MS: config.RATE_LIMIT_AUTH_WINDOW_MS,
      AUTH_LIMIT: config.RATE_LIMIT_AUTH_LIMIT,
      REFRESH_TOKEN_WINDOW_MS: config.RATE_LIMIT_REFRESH_TOKEN_WINDOW_MS,
      REFRESH_TOKEN_LIMIT: config.RATE_LIMIT_REFRESH_TOKEN_LIMIT,
      CHECK_AUTH_WINDOW_MS: config.RATE_LIMIT_CHECK_AUTH_WINDOW_MS,
      CHECK_AUTH_LIMIT: config.RATE_LIMIT_CHECK_AUTH_LIMIT,
      CVS_WINDOW_MS: config.RATE_LIMIT_CVS_LIMIT,
      CVS_LIMIT: config.RATE_LIMIT_CVS_WINDOW_MS,
    };
  }

  /**
   * Create a rate limit middleware with custom configuration
   */
  private createRateLimit(config: RateLimitConfig) {
    return rateLimit({
      windowMs: config.windowMs,
      limit: config.limit,
      message: config.message || 'Too many requests from this IP, please try again later!',
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
      handler: (req: Request, res: Response, next: NextFunction) => {
        // Create and pass error to next middleware
        const error = new AppError(
          config.message || 'Too many requests', 
          429, 
          ErrorTypes.TOO_MANY_REQUESTS
        );
        next(error);
      }
    });
  }

    public globalRateLimit() {
        return this.createRateLimit({
            windowMs: this.config.DEFAULT_WINDOW_MS,
            limit: this.config.DEFAULT_LIMIT,
            message: 'Too many requests from this IP, please try again later!',
        });
    }

    public CVsRateLimit() {
        return this.createRateLimit({
            windowMs: this.config.DEFAULT_WINDOW_MS,
            limit: this.config.DEFAULT_LIMIT,
            message: 'Too many requests from this IP, please try again later!',
        });
    }


    public loginLimit() { 
        return this.createRateLimit({
            windowMs: this.config.AUTH_WINDOW_MS as number,
            limit: this.config.AUTH_LIMIT as number,
            message: "Too many login attempts, try again later!"
        })
    }

    public registerLimit() {
        return this.createRateLimit({
            windowMs: this.config.AUTH_WINDOW_MS as number,
            limit: this.config.AUTH_LIMIT as number,
            message: "Too many registration attempts, try again later!"
        })
    }

    public logoutLimit() {
        return this.createRateLimit({
            windowMs: this.config.AUTH_WINDOW_MS as number,
            limit: this.config.AUTH_LIMIT as number,
            message: "Too many logout attempts, try again later!"
        })
    }

    public refreshTokenLimit() {
        return this.createRateLimit({
            windowMs: this.config.REFRESH_TOKEN_WINDOW_MS as number,
            limit: this.config.REFRESH_TOKEN_LIMIT as number,
            message: "Too many refresh token attempts, try again later!"
        })
    }

    public checkAuthLimit() {
        return this.createRateLimit({
            windowMs: this.config.CHECK_AUTH_WINDOW_MS as number,
            limit: this.config.CHECK_AUTH_LIMIT as number,
            message: `Too many refresh token attempts, try again later! ${this.config.CHECK_AUTH_WINDOW_MS}`
        })
    }
}

const RateLimitInstance = new RateLimitMiddleware();

export default RateLimitInstance;
