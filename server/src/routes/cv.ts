import express from 'express';
import RateLimitInstance from '../middleware/rate_limit_middleware';
import { catchAsync } from '../middleware/error_middleware';
import { CVsController } from '../controllers/cv';

const router = express.Router();

router.get(
    '',
    RateLimitInstance.CVsRateLimit(),
    catchAsync(CVsController.getAll)
)

router.put(
    '/sync',
    RateLimitInstance.CVsRateLimit(),
    catchAsync(CVsController.sync)
)

router.post(
    '',
    RateLimitInstance.CVsRateLimit(),
    catchAsync(CVsController.create)
)

router.post(
    '/import',
    RateLimitInstance.CVsRateLimit(),
    catchAsync(CVsController.import)
)

router.delete(
    '/:id',
    RateLimitInstance.CVsRateLimit(),
    catchAsync(CVsController.delete)
)

export default router;