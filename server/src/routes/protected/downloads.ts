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
    '/',
    RateLimitInstance.globalRateLimit(),
    upload.single('file'),
    catchAsync(DownloadsController.executeDownload)
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