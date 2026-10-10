import { StripeController } from '../../controllers/stripe';
import RateLimitInstance from '../../middleware/rate_limit_middleware';
import express from 'express';
import { catchAsync } from '../../middleware/error_middleware';

const router = express.Router();

router.post(
    '/create_payment_intent',
    RateLimitInstance.globalRateLimit(),
    catchAsync(StripeController.createPaymentIntent)
)

router.post(
    '/create_subscription_checkout',
    RateLimitInstance.globalRateLimit(),
    catchAsync(StripeController.createSubscriptionCheckout)
)

router.post(
    '/confirm_setup_and_subscribe',
    RateLimitInstance.globalRateLimit(),
    catchAsync(StripeController.confirmSetupAndSubscribe)
)

router.post(
    '/cancel_subscription',
    RateLimitInstance.globalRateLimit(),
    catchAsync(StripeController.cancelSubscription)
)

router.post(
    '/resume_subscription',
    RateLimitInstance.globalRateLimit(),
    catchAsync(StripeController.resumeSubscription)
)

router.get(
    '/prices',
    RateLimitInstance.globalRateLimit(),
    catchAsync(StripeController.getPricingPlans)
)

export default router