import express from 'express';
import RateLimitInstance from '../../middleware/rate_limit_middleware';
import { catchAsync } from '../../middleware/error_middleware';
import { UserController } from '../../controllers/user';

const router = express.Router();

router.get(
    '/account',
    RateLimitInstance.globalRateLimit(),
    catchAsync(UserController.getAccountData)
);

router.post(
    '/sync_initial_data',
    RateLimitInstance.globalRateLimit(),
    catchAsync(UserController.syncInitialData)
);

export default router;