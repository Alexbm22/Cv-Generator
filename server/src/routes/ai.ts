import { AiController } from '@/controllers/ai';
import { resolveActor } from '@/middleware/actor';
import { aiUsageGate } from '@/middleware/ai_usage_middleware';
import RateLimitInstance from '@/middleware/rate_limit_middleware';
import express, { NextFunction, Request, Response } from 'express';

const router = express.Router();

router.post(
  '/chat',
  RateLimitInstance.globalRateLimit(),
  resolveActor({ create: true }),
  aiUsageGate('cv_edit'),
  (req, res, next) => AiController.GuestChat(req as Request, res as Response, next as NextFunction),
);

router.post(
  '/about-me',
  RateLimitInstance.globalRateLimit(),
  resolveActor({ create: true }),
  aiUsageGate('cv_edit'),
  (req, res, next) => AiController.GuestAboutMeChat(req as Request, res as Response, next as NextFunction),
);

export default router;
