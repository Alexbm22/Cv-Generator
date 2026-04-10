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

router.post(
    '/change_password',
    RateLimitInstance.globalRateLimit(),
    catchAsync(UserController.changePassword)
);

router.post(
    '/preferences/profile_picture_default',
    RateLimitInstance.globalRateLimit(),
    catchAsync(UserController.updateProfilePicturePreference)
);

export default router;