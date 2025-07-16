import { DownloadsController } from '../controllers/downloads';
import { catchAsync } from '../middleware/error_middleware';
import RateLimitInstance from '../middleware/rate_limit_middleware';
import express from 'express';

const router = express.Router();

router.post(
    '/initiate',
    RateLimitInstance.globalRateLimit(),
    catchAsync(DownloadsController.initDownload)
)

export default router;