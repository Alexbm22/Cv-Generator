import express from 'express';
import { catchAsync } from '../middleware/error_middleware';
import RateLimitInstance from '../middleware/rate_limit_middleware';
import { authMiddleware } from '../middleware/auth_middleware';
import { Validate } from '../middleware/validation_middleware';
import { registrationRules, loginRules } from '../validators/auth_validators';
import { AuthController } from '../controllers/auth_controller';

const router = express.Router();

const authController = new AuthController();

router.post(
    '/google_login',
    RateLimitInstance.loginLimit(),
    catchAsync(authController.googleLogin.bind(authController))
)

router.post(
    '/login',
    RateLimitInstance.loginLimit(),
    Validate('login' ,loginRules),
    catchAsync(authController.login.bind(authController))
)

router.post(
    '/register',
    RateLimitInstance.registerLimit(),
    Validate('register', registrationRules),
    catchAsync(authController.register.bind(authController))
)

router.post(
    '/logout',
    authMiddleware,
    RateLimitInstance.logoutLimit(),
    catchAsync(authController.logout.bind(authController))
)

router.get(
    '/refresh_token',
    RateLimitInstance.refreshTokenLimit(),
    catchAsync(authController.refreshToken.bind(authController))
)

router.get(
    '/check_auth',
    RateLimitInstance.checkAuthLimit(),
    catchAsync(authController.checkAuth.bind(authController))
)

export default router;
