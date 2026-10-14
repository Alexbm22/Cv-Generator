import { Request, Response } from "express";
import { AppError } from "../middleware/error_middleware";
import { ErrorTypes } from "../interfaces/error";
import { stripe } from '../app';
import Stripe from "stripe";
import { config } from "../config/env";
import { StripeWebhookController } from "../controllers/stripeWebhook";
import { ActionLogService } from "../services/actionLog";

const endpointSecret = config.STRIPE_WEBHOOK_SECRET;

const stripeWebHook = async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string;
    if(!endpointSecret){
        res.json({received: true});
        return;
    }

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
    } catch (error) {
        const errorMessage =
            error && typeof error === "object" && "message" in error
                ? (error as { message: string }).message
                : "Failed to construct event";
        throw new AppError(
            "Webhook Error: " + errorMessage,
            400,
            ErrorTypes.BAD_REQUEST
        );
    }

    try {
        await StripeWebhookController.handleEvent(event);
    } catch (error) {
        // 4xx is permanent and acked to stop retries; anything else returns 500 so Stripe retries.
        console.error(`Error handling webhook event ${event.type}:`, error);

        const statusCode = error instanceof AppError ? error.statusCode : 500;
        const retryable = statusCode >= 500;

        try {
            await ActionLogService.appendStripeReconciliation({
                schemaVersion: 1,
                timestamp: new Date().toISOString(),
                level: retryable ? 'error' : 'warn',
                event: 'stripe_webhook_failed',
                eventId: event.id,
                eventType: event.type,
                paymentIntentId: event.type.startsWith('payment_intent')
                    ? (event.data.object as Stripe.PaymentIntent).id
                    : null,
                statusCode,
                retryable,
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? (error.stack ?? null) : null,
            });
        } catch (logError) {
            console.error('Failed to write Stripe reconciliation log:', logError);
        }

        if (retryable) {
            res.status(500).json({ received: false });
            return;
        }
    }

    res.json({received: true});
}

export default stripeWebHook