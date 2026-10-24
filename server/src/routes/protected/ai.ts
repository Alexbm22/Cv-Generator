import express, { NextFunction, Response } from 'express';
import RateLimitInstance from '../../middleware/rate_limit_middleware';
import { aiUsageGate } from '../../middleware/ai_usage_middleware';
import { AiController } from '../../controllers/ai';
import { AuthRequest } from '../../interfaces/auth';

const router = express.Router();

router.post(
  '/chat',
  RateLimitInstance.globalRateLimit(),
  aiUsageGate('cv_edit'),
  (req, res, next) => AiController.ProtectedChat(req as AuthRequest, res as Response, next as NextFunction),
);

router.post(
  '/about-me',
  RateLimitInstance.globalRateLimit(),
  aiUsageGate('cv_edit'),
  (req, res, next) => AiController.ProtectedAboutMeChat(req as AuthRequest, res as Response, next as NextFunction),
);

router.post(
  '/translate',
  RateLimitInstance.globalRateLimit(),
  aiUsageGate('cv_translate'),
  (req, res, next) => AiController.ProtectedTranslate(req as AuthRequest, res as Response, next as NextFunction),
);

export default router;
