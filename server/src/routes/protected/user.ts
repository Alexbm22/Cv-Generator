import express from 'express';
import RateLimitInstance from '../../middleware/rate_limit_middleware';
import { catchAsync } from '../../middleware/error_middleware';
import { UserController } from '../../controllers/user';
import { Validate } from '../../middleware/validation_middleware';
import { updateCustomColorsRules } from '../../validators/user_validators';

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

router.post(
    '/preferences/custom_colors',
    RateLimitInstance.globalRateLimit(),
    Validate('Custom Colors', updateCustomColorsRules),
    catchAsync(UserController.updateCustomColors)
);

router.get(
    '/preferences',
    RateLimitInstance.globalRateLimit(),
    catchAsync(UserController.getUserPreferences)
);

export default router;