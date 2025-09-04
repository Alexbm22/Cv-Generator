import { catchAsync } from '../../middleware/error_middleware';
import RateLimitInstance from '../../middleware/rate_limit_middleware';
import express from 'express';
import { MediaFilesController } from '../../controllers/mediaFile';

const router = express.Router();

router.get(
    '/:id',
    RateLimitInstance.CVsRateLimit(),
    catchAsync(MediaFilesController.getMediaFile)
)

export default router;