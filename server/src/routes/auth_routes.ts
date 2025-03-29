import express from 'express';
import { catchAsync } from '../middleware/error_middleware';
import { RateLimitMiddleware } from '../middleware/rate_limit_middleware';
import { RegistrationValidation, LoginValidator } from '../validators/auth_validators';
import { AuthController } from '../controllers/auth_controller';

const router = express.Router();

router.post(
    '/login',
    RateLimitMiddleware.loginLimit,
    LoginValidator,
    catchAsync(AuthController.login)
)

export default router;
