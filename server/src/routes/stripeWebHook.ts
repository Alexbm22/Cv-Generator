import { Request, Response } from "express";
import { AppError } from "../middleware/error_middleware";
import { ErrorTypes } from "../interfaces/error";
import { stripe } from '../app';
import Stripe from "stripe";
import { config } from "../config/env";
import { StripeWebhookController } from "../controllers/stripeWebhook";

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
        // Signature was valid, so always ack 200 to Stripe - internal failures shouldn't trigger retry storms.
        console.error(`Error handling webhook event ${event.type}:`, error);
    }

    res.json({received: true});
}

export default stripeWebHook