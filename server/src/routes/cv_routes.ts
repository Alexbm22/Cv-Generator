import express from 'express';
import RateLimitInstance from '../middleware/rate_limit_middleware';
import { catchAsync } from '../middleware/error_middleware';
import { CVsController } from '../controllers/cv_controller';

const router = express.Router();

router.get(
    '/cvs',
    RateLimitInstance.CVsRateLimit(),
    catchAsync(CVsController.getAll)
)

router.put(
    '/cvs/sync',
    RateLimitInstance.CVsRateLimit(),
    catchAsync(CVsController.sync)
)

router.post(
    '/cvs',
    RateLimitInstance.CVsRateLimit(),
    catchAsync(CVsController.create)
)

router.post(
    '/cvs/import',
    RateLimitInstance.CVsRateLimit(),
    catchAsync(CVsController.import)
)

router.delete(
    '/cvs/:id',
    RateLimitInstance.CVsRateLimit(),
    catchAsync(CVsController.delete)
)

export default router;