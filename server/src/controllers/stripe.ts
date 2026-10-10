import { AuthRequest } from "../interfaces/auth";
import { StripeService } from "../services/stripe"
import { NextFunction, Response } from "express"

export class StripeController {

    static async getPricingPlans(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const response = await StripeService.getStripeProducts();
            return res.status(200).json(response)
        } catch (error) {
            next(error)
        }
    }

    static async createPaymentIntent(req: AuthRequest, res: Response, next: NextFunction) {
        const { priceLookupKey, quantity } = req.body;
        const user = req.user.get();

        try {
            const paymentIntentRes = await StripeService.createPaymentIntent(priceLookupKey, user, quantity);
            return res.status(200).json(paymentIntentRes);
        } catch (error) {
            return next(error);
        }
    }

    static async createSubscriptionCheckout(req: AuthRequest, res: Response, next: NextFunction) {
        const { priceLookupKey } = req.body;
        const user = req.user.get();

        try {
            const clientSecret = await StripeService.createSubscriptionCheckout(
                priceLookupKey,
                user
            );
            return res.status(200).json(clientSecret);
        } catch (error) {
            return next(error);
        }
    }

    // Confirms a SetupIntent, attaches the payment method to the customer, and creates the subscription.
    static async confirmSetupAndSubscribe(req: AuthRequest, res: Response, next: NextFunction) {
        const { setupIntentId, priceLookupKey } = req.body;
        const user = req.user.get();

        try {
            if (!setupIntentId || !priceLookupKey) {
                return res.status(400).json({
                    error: 'setupIntentId and priceLookupKey are required.'
                });
            }

            // Step 1: Confirm SetupIntent and get PaymentMethod
            const paymentMethod = await StripeService.confirmSetupIntentAndGetPaymentMethod(setupIntentId);

            // Step 2: Attach PaymentMethod to customer and set as default
            await StripeService.attachPaymentMethodToCustomer(user.stripeCustomerId!, paymentMethod.id);

            // Step 3: Create subscription with the payment method
            const subscriptionId = await StripeService.createSubscriptionWithPaymentMethod(
                user.stripeCustomerId!,
                paymentMethod.id,
                priceLookupKey
            );

            return res.status(200).json({
                subscriptionId,
                status: 'pending_webhook'
            });
        } catch (error) {
            return next(error);
        }
    }

    static async cancelSubscription(req: AuthRequest, res: Response, next: NextFunction) {
        const user = req.user.get();

        try {
            const result = await StripeService.cancelCurrentSubscription(user);
            return res.status(200).json(result);
        } catch (error) {
            return next(error);
        }
    }

    static async resumeSubscription(req: AuthRequest, res: Response, next: NextFunction) {
        const user = req.user.get();

        try {
            const result = await StripeService.resumeCurrentSubscription(user);
            return res.status(200).json(result);
        } catch (error) {
            return next(error);
        }
    }
}