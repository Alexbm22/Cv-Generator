import Stripe from "stripe";
import { stripe } from "@/app";
import sequelize from "@/config/DB/database_config";
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
            const price = await StripeService.getPriceById(paymentIntent.metadata.priceId);

            if (price.type === 'recurring') {
                throw new AppError(
                    'Invalid request: Received a recurring payment intent in the webhook.',
                    400,
                    ErrorTypes.BAD_REQUEST
                );
            }

            const creditsToAdd = price.metadata?.credits
                ? parseInt(price.metadata.credits, 10)
                : Number(paymentIntent.metadata.quantity) || 0;

            if (!(await PaymentService.getPayment(paymentIntent.id))) {
                try {
                    await PaymentService.createPayment(paymentIntent, price);
                } catch (error) {
                    if (!(await PaymentService.getPayment(paymentIntent.id))) {
                        throw error;
                    }
                }
            }

            try {
                await sequelize.transaction(async transaction => {
                    const payment = await PaymentService.getPayment(paymentIntent.id, { transaction, lock: true });
                    if (!payment) {
                        throw new AppError("Payment not found.", 404, ErrorTypes.NOT_FOUND);
                    }

                    if (payment.get().status === PaymentStatus.SUCCEEDED) {
                        return;
                    }

                    await PaymentService.updatePayment(paymentIntent, undefined, transaction);
                    await CreditsService.addCredits(payment.get().user_id, creditsToAdd, transaction);
                });
            } catch (error) {
                // Rollback reverted the status; record FAILED outside the transaction so the UI shows it.
                await PaymentService.updatePayment(paymentIntent, PaymentStatus.FAILED)
                    .catch(markError => console.error(`Failed to mark payment ${paymentIntent.id} as FAILED:`, markError));

                // Any grant failure must be 500 so Stripe retries; a 4xx would ack the event and keep the charge.
                throw new AppError(
                    `Failed to grant credits for payment intent ${paymentIntent.id}.`,
                    500,
                    ErrorTypes.INTERNAL_ERR,
                    undefined,
                    error instanceof Error ? error : undefined
                );
            }
            break;
        }
        default:
            await PaymentService.updatePayment(paymentIntent);
            break;
    }
};
