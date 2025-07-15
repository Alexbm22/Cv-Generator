import { Request, Response } from "express";
import { stripe } from '../app';
import { AppError } from "../middleware/error_middleware";
import { ErrorTypes } from "../interfaces/error";
import { PaymentService } from "../services/payments";
import Stripe from "stripe";
import { SubscriptionService } from "../services/subscriptions";
import { CreditsService } from "../services/credits";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export default async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string;
    
    if(endpointSecret){
        try {
            const event = stripe.webhooks.constructEvent(
                req.body,
                signature,
                endpointSecret
            );

            if(event.type.startsWith("payment_intent")) {
                switch (event.type) {
                    case 'payment_intent.created':
                        const paymentIntent = event.data.object as Stripe.PaymentIntent;
                        const price = await stripe.prices.retrieve(paymentIntent.metadata.priceId);
                        await PaymentService.createPayment(paymentIntent, price);
                        break;
                    case 'payment_intent.succeeded':
                        const succeededPaymentIntent = event.data.object as Stripe.PaymentIntent;
                        const succeededPayment = await PaymentService.updatePayment(succeededPaymentIntent);

                        if( succeededPayment?.price.type === 'recurring' ) {
                            // Handle recurring payment success
                            await SubscriptionService.createSubscription(succeededPayment);

                        } else if( succeededPayment?.price.type === 'one_time' ) {
                            // Handle one-time payment success
                            await CreditsService.addCredits(
                                succeededPayment.user_id,
                                succeededPayment.quantity!
                            )
                        }
                        break;
                    default: 
                        const defaultPaymentIntent = event.data.object as Stripe.PaymentIntent;
                        await PaymentService.updatePayment(defaultPaymentIntent);
                        break;
                }
            }
        } catch (error) {
            const errorMessage =
                error && typeof error === "object" && "message" in error
                    ? (error as { message: string }).message
                    : "Failed to construct event";
            new AppError(
                "Webhook Error: " + errorMessage,
                400,
                ErrorTypes.BAD_REQUEST
            );
            res.sendStatus(400);
        }
    }

    res.json({received: true});
}