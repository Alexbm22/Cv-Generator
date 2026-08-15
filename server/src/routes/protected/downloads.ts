import { DownloadsController } from '../../controllers/downloads';
import { catchAsync } from '../../middleware/error_middleware';
import RateLimitInstance from '../../middleware/rate_limit_middleware';
import multer from 'multer';
import express from 'express';

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { 
        fileSize: 10 * 1024 * 1024,
        files: 1
    },
    fileFilter: (req, file, cb) => {
        cb(null, file.mimetype === 'application/pdf');
    }
})

router.post(
    '/prepare',
    RateLimitInstance.globalRateLimit(),
    catchAsync(DownloadsController.prepareDownload)
)

router.post(
    '/:id/complete',
    RateLimitInstance.globalRateLimit(),
    catchAsync(DownloadsController.completeDownload)
)

router.post(
    '/:id/fail',
    RateLimitInstance.globalRateLimit(),
    catchAsync(DownloadsController.failDownload)
)

router.get(
    '/check-download-rights',
    RateLimitInstance.globalRateLimit(),
    catchAsync(DownloadsController.checkDownloadRights)
)

router.get(
    '/check-duplicate',
    RateLimitInstance.globalRateLimit(),
    catchAsync(DownloadsController.checkDuplicateDownload)
)

router.post(
    '/validate',
    RateLimitInstance.globalRateLimit(),
    catchAsync(DownloadsController.validateDownload)
)

router.get(
    '/',
    RateLimitInstance.globalRateLimit(),
    catchAsync(DownloadsController.getDownloads)
)

router.delete(
    '/:id',
    RateLimitInstance.CVsRateLimit(),
    catchAsync(DownloadsController.deleteDownload)
)

router.post(
    '/duplicate/:id',
    RateLimitInstance.globalRateLimit(),
    catchAsync(DownloadsController.duplicateDownload)
)


export default router;