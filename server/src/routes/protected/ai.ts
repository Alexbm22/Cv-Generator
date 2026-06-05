import express, { Response } from 'express';
import RateLimitInstance from '../../middleware/rate_limit_middleware';
import { AiController } from '../../controllers/ai';
import { AuthRequest } from '../../interfaces/auth';

const router = express.Router();

router.post(
  '/chat',
  RateLimitInstance.globalRateLimit(),
  (req, res) => AiController.ProtectedChat(req as AuthRequest, res as Response),
);

router.post(
  '/about-me',
  RateLimitInstance.globalRateLimit(),
  (req, res) => AiController.ProtectedAboutMeChat(req as AuthRequest, res as Response),
);

export default router;
