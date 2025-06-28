import express from 'express';
import { RateLimitMiddleware } from '../middleware/rate_limit_middleware';
import { catchAsync } from '../middleware/error_middleware';
import { CVsController } from '../controllers/cv_controller';

const router = express.Router();
const RateLimitInstance = new RateLimitMiddleware();

const CVsControllerInstance = new CVsController();

router.get(
    '/get_CVs',
    RateLimitInstance.CVsRateLimit(),
    catchAsync(CVsControllerInstance.getCVs.bind(CVsControllerInstance))
)

router.post(
    '/sync_CVs',
    RateLimitInstance.CVsRateLimit(),
    catchAsync(CVsControllerInstance.syncCVs.bind(CVsControllerInstance))
)

router.post(
    '/create_CV',
    RateLimitInstance.CVsRateLimit(),
    catchAsync(CVsControllerInstance.createNewCV.bind(CVsControllerInstance))
)

router.post(
    '/create_existing_CVs',
    RateLimitInstance.CVsRateLimit(),
    catchAsync(CVsControllerInstance.createCVs.bind(CVsControllerInstance))
)

router.post(
    '/delete_CV',
    RateLimitInstance.CVsRateLimit(),
    catchAsync(CVsControllerInstance.deleteCV.bind(CVsControllerInstance))
)

export default router;