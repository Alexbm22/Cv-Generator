import { AiController } from '@/controllers/ai';
import { resolveActor } from '@/middleware/actor';
import RateLimitInstance from '@/middleware/rate_limit_middleware';
import express, { Request, Response } from 'express';

const router = express.Router();

router.post(
  '/chat',
  RateLimitInstance.globalRateLimit(),
  resolveActor({ create: true }),
  (req, res) => AiController.GuestChat(req as Request, res as Response),
);

router.post(
  '/about-me',
  RateLimitInstance.globalRateLimit(),
  resolveActor({ create: true }),
  (req, res) => AiController.GuestAboutMeChat(req as Request, res as Response),
);

export default router;
