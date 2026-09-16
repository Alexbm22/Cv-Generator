import Stripe from "stripe";
import { stripe } from "@/app";
import { AppError } from "@/middleware/error_middleware";
import { ErrorTypes } from "@/interfaces/error";
import { PaymentStatus } from "@/interfaces/payments";
import { CreditsService } from "@/services/credits";
import { PaymentService } from "@/services/payments";
import { StripeService } from "@/services/stripe";

export const handlePaymentIntentEvent = async (event: Stripe.Event): Promise<void> => {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    // Subscription-renewal PaymentIntents have no metadata.priceId (only checkout-created ones do)
    // and are fully owned by invoice.* handlers.
    if (!paymentIntent.metadata?.priceId) {
        console.log(`Skipping ${event.type}: PaymentIntent ${paymentIntent.id} has no metadata.priceId, treating as invoice-owned.`);
        return;
    }

    switch (event.type) {
        case 'payment_intent.payment_failed':
            await PaymentService.updatePayment(paymentIntent, PaymentStatus.FAILED);
            break;
        case 'payment_intent.canceled':
            await PaymentService.updatePayment(paymentIntent);
            break;
        case 'payment_intent.created': {
            const price = await stripe.prices.retrieve(paymentIntent.metadata.priceId);
            await PaymentService.createPayment(paymentIntent, price);
            break;
        }
        case 'payment_intent.succeeded': {
            const paymentBeforeUpdate = await PaymentService.getPayment(paymentIntent.id);
            const wasAlreadySucceeded = paymentBeforeUpdate?.get().status === PaymentStatus.SUCCEEDED;

            await PaymentService.updatePayment(paymentIntent);

            const updatedPayment = await PaymentService.getPayment(paymentIntent.id);
            if (!updatedPayment) {
                throw new AppError(
                    "Payment not found after update.",
                    404,
                    ErrorTypes.NOT_FOUND
                );
            }

            if (wasAlreadySucceeded) {
                return;
            }

            const updatedPaymentData = updatedPayment.get();
            if (!updatedPaymentData.price) {
                return;
            }

            if (updatedPaymentData.price.type === 'recurring') {
                throw new AppError(
                    'Invalid request: Received a recurring payment intent in the webhook.',
                    400,
                    ErrorTypes.BAD_REQUEST
                );
            }

            if (updatedPaymentData.price.type === 'one_time') {
                const price = await StripeService.getPriceById(updatedPaymentData.price.id);
                const creditsToAdd = price?.metadata?.credits
                    ? parseInt(price.metadata.credits, 10)
                    : updatedPaymentData.quantity || 0;

                await CreditsService.addCredits(
                    updatedPaymentData.user_id,
                    creditsToAdd,
                );
            }
            break;
        }
        default:
            await PaymentService.updatePayment(paymentIntent);
            break;
    }
};
