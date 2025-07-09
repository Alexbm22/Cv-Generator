import { StripeController } from '../controllers/stripe';
import RateLimitInstance from '../middleware/rate_limit_middleware';
import express from 'express';
import { catchAsync } from '../middleware/error_middleware';

const router = express.Router();

router.get(
    '/create_payment_intent',
    RateLimitInstance.globalRateLimit(),
    catchAsync(StripeController.createPaymentIntent)
)

router.get(
    '/products',
    RateLimitInstance.globalRateLimit(),
    catchAsync(StripeController.getProucts)
)

export default router