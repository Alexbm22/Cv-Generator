import express from 'express';
import RateLimitInstance from '../../middleware/rate_limit_middleware';
import { catchAsync } from '../../middleware/error_middleware';
import { UserController } from '../../controllers/user';

const router = express.Router();

router.get(
    '/profile',
    RateLimitInstance.globalRateLimit(),
    catchAsync(UserController.getUserProfile)
);

export default router;