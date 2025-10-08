import { Request, Response } from "express";
import { stripe } from '../app';
import { AppError } from "../middleware/error_middleware";
import { ErrorTypes } from "../interfaces/error";
import { PaymentService } from "../services/payments";
import Stripe from "stripe";
import { SubscriptionService } from "../services/subscriptions";
import { CreditsService } from "../services/credits";
import { config } from "../config/env";

const endpointSecret = config.STRIPE_WEBHOOK_SECRET;

const stripeWebHook = async (req: Request, res: Response) => {
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
                        
                        await PaymentService.updatePayment(succeededPaymentIntent);
                        
                        const updatedPayment = await PaymentService.getPayment(succeededPaymentIntent.id);
                        
                        if(!updatedPayment) {
                            throw new AppError(
                                "Payment not found after update.",
                                404,
                                ErrorTypes.NOT_FOUND
                            );
                        }

                        const updatedPaymentData = updatedPayment.get();
                        
                        if( updatedPaymentData?.price.type === 'recurring' ) {
                            // Handle recurring payment success
                            await SubscriptionService.createSubscription(updatedPaymentData);

                        } else if( updatedPaymentData?.price.type === 'one_time' ) {
                            // Handle one-time payment success
                            await CreditsService.addCredits(
                                updatedPaymentData.user_id,
                                updatedPaymentData.quantity!
                            )
                        }
                        break;
                    default: 
                        const defaultPaymentIntent = event.data.object as Stripe.PaymentIntent;
                        await PaymentService.updatePayment(defaultPaymentIntent);
                }
            }
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
    }

    res.json({received: true});
}

export default stripeWebHook