import express, { NextFunction, Response } from 'express';
import { catchAsync } from '../middleware/error_middleware';
import RateLimitInstance from '../middleware/rate_limit_middleware';
import { authMiddleware } from '../middleware/auth_middleware';
import { Validate } from '../middleware/validation_middleware';
import { registrationRules, loginRules } from '../validators/auth_validators';
import { AuthController } from '../controllers/auth';
import { AuthRequest } from '../interfaces/auth';

const router = express.Router();

const createRouterHandler = (controllerMethod: (req: AuthRequest, res: Response, next: NextFunction) => Promise<any>) => {
    return catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const controller = new AuthController(); 
        controllerMethod.call(controller, req, res, next);
    })
}

router.post(
    '/google_login',
    RateLimitInstance.loginLimit(),
    createRouterHandler(AuthController.prototype.googleLogin)
)

router.post(
    '/login',
    RateLimitInstance.loginLimit(),
    Validate('login' ,loginRules),
    createRouterHandler(AuthController.prototype.login)
)

router.post(
    '/register',
    RateLimitInstance.registerLimit(),
    Validate('register', registrationRules),
    createRouterHandler(AuthController.prototype.register)
)

router.post(
    '/logout',
    authMiddleware,
    RateLimitInstance.logoutLimit(),
    createRouterHandler(AuthController.prototype.logout)
)

router.get(
    '/refresh_token',
    RateLimitInstance.refreshTokenLimit(),
    createRouterHandler(AuthController.prototype.refreshToken)
)

router.get(
    '/check_auth',
    RateLimitInstance.checkAuthLimit(),
    createRouterHandler(AuthController.prototype.checkAuth)
)

export default router;
