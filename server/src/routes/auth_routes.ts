import express from 'express';
import { catchAsync } from '../middleware/error_middleware';
import { RateLimitMiddleware } from '../middleware/rate_limit_middleware';
import { authMiddleware } from '../middleware/auth_middleware';
import { Validate } from '../middleware/validation_middleware';
import { registrationRules, loginRules } from '../validators/auth_validators';
import { AuthController } from '../controllers/auth_controller';

const router = express.Router();

const authController = new AuthController();

router.post(
    '/google_login',
    RateLimitMiddleware.loginLimit,
    catchAsync(authController.googleLogin.bind(authController))
)

router.post(
    '/login',
    RateLimitMiddleware.loginLimit,
    Validate('Login' ,loginRules),
    catchAsync(authController.login.bind(authController))
)

router.post(
    '/register',
    RateLimitMiddleware.registerLimit,
    Validate('Register', registrationRules),
    catchAsync(authController.register.bind(authController))
)

router.post(
    '/logout',
    authMiddleware,
    RateLimitMiddleware.logoutLimit,
    catchAsync(authController.logout.bind(authController))
)

router.post(
    '/refresh_token',
    RateLimitMiddleware.refreshTokenLimit,
    catchAsync(authController.refreshToken.bind(authController))
)

export default router;
