import { DownloadsController } from '../controllers/downloads';
import { catchAsync } from '../middleware/error_middleware';
import RateLimitInstance from '../middleware/rate_limit_middleware';
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
    '/initiate',
    RateLimitInstance.globalRateLimit(),
    upload.single('file'),
    catchAsync(DownloadsController.initDownload)
)

export default router;