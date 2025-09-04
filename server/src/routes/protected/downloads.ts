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
    catchAsync(DownloadsController.createDownload)
)

router.get(
    '/',
    RateLimitInstance.globalRateLimit(),
    catchAsync(DownloadsController.getDownloads)
)

router.get(
    '/:download_id/file',
    RateLimitInstance.globalRateLimit(),
    catchAsync(DownloadsController.downloadFile)
)

export default router;