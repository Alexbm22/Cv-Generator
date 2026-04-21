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

router.delete(
    '/:id',
    RateLimitInstance.CVsRateLimit(),
    catchAsync(MediaFilesController.deleteMediaFile)
)

router.get(
    '/:id/put_url',
    RateLimitInstance.CVsRateLimit(),
    catchAsync(MediaFilesController.getMediaFilePutUrl)
)

router.get(
    '/:id/get_url',
    RateLimitInstance.CVsRateLimit(),
    catchAsync(MediaFilesController.getMediaFileGetUrl)
)

router.patch(
    '/:id/active',
    RateLimitInstance.CVsRateLimit(),
    catchAsync(MediaFilesController.markMediaFileActiveStatus)
)

export default router;