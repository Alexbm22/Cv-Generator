import { AppError } from "@/middleware/error_middleware";
import Stripe from "stripe";
import { stripe } from "@/app";
import { ErrorTypes } from "@/interfaces/error";
import { PaymentCreationAttributes, PaymentSource, PaymentStatus } from "@/interfaces/payments";
import { StripeService } from "@/services/stripe";
import { paymentRepository, subscriptionRepository, userRepository } from "@/repositories";
import { handleServiceError } from "@/utils/serviceErrorHandler";
import { stripeMappers } from "@/mappers";

export class PaymentService {
    private static mapPaymentIntentStatus(status: Stripe.PaymentIntent.Status): PaymentStatus {
        switch (status) {
            case 'succeeded':
                return PaymentStatus.SUCCEEDED;
            case 'canceled':
                return PaymentStatus.CANCELED;
            case 'processing':
                return PaymentStatus.PROCESSING;
            case 'requires_action':
                return PaymentStatus.REQUIRES_ACTION;
            case 'requires_capture':
                return PaymentStatus.REQUIRES_CAPTURE;
            case 'requires_confirmation':
                return PaymentStatus.REQUIRES_CONFIRMATION;
            case 'requires_payment_method':
                return PaymentStatus.REQUIRES_PAYMENT_METHOD;
            default:
                return PaymentStatus.PENDING;
        }
    }

    private static parseUnixTimestamp(value?: number | null): Date | null {
        return value ? new Date(value * 1000) : null;
    }

    private static buildStatusTimestamps(status: PaymentStatus, eventDate: Date = new Date()) {
        return {
            paid_at: status === PaymentStatus.SUCCEEDED ? eventDate : null,
            failed_at: status === PaymentStatus.FAILED ? eventDate : null,
            canceled_at: status === PaymentStatus.CANCELED ? eventDate : null,
        };
    }

    private static async findExistingPaymentByStripeIdentifiers(
        stripePaymentIntentId: string | null,
        stripeInvoiceId: string | null,
    ) {
        if (stripeInvoiceId) {
            const byInvoice = await paymentRepository.getPayment({ stripe_invoice_id: stripeInvoiceId });
            if (byInvoice) {
                return byInvoice;
            }
        }

        if (stripePaymentIntentId) {
            const byIntent = await paymentRepository.getPayment({ stripe_payment_intent_id: stripePaymentIntentId });
            if (byIntent) {
                return byIntent;
            }
        }

        return null;
    }

    private static async resolveUserId(
        customerId: string | null,
        fallbackUserId?: number,
    ): Promise<number | undefined> {
        if (fallbackUserId) {
            return fallbackUserId;
        }

        if (customerId) {
            const user = await userRepository.getUserByFields({ stripeCustomerId: customerId });
            return user?.id;
        }

        return undefined;
    }

    private static async upsertPayment(
        identifiers: {
            stripe_payment_intent_id: string | null;
            stripe_invoice_id: string | null;
        },
        payload: Omit<PaymentCreationAttributes, 'stripe_payment_intent_id' | 'stripe_invoice_id'>,
    ) {
        const existingPayment = await this.findExistingPaymentByStripeIdentifiers(
            identifiers.stripe_payment_intent_id,
            identifiers.stripe_invoice_id,
        );

        if (existingPayment) {
            const existingData = existingPayment.get();
            await paymentRepository.updatePaymentByFields(
                {
                    ...payload,
                    stripe_payment_intent_id: identifiers.stripe_payment_intent_id ?? existingData.stripe_payment_intent_id,
                    stripe_invoice_id: identifiers.stripe_invoice_id ?? existingData.stripe_invoice_id,
                },
                { id: existingData.id }
            );
        } else {
            await paymentRepository.createPayment({
                ...payload,
                stripe_payment_intent_id: identifiers.stripe_payment_intent_id,
                stripe_invoice_id: identifiers.stripe_invoice_id,
            });
        }
    }

    @handleServiceError("Failed to create payment record in the database.")
    static async createPayment(
        paymentIntent: Stripe.PaymentIntent,
        price: Stripe.Price
    ) {
        const customerId = typeof paymentIntent.customer === 'string' ? paymentIntent.customer : null;
        const userId = await this.resolveUserId(
            customerId,
            paymentIntent.metadata.userId ? Number(paymentIntent.metadata.userId) : undefined,
        );

        if (!userId) {
            throw new AppError(
                `Could not resolve user for payment intent ${paymentIntent.id}.`,
                404,
                ErrorTypes.NOT_FOUND
            );
        }

        const normalizedStatus = this.mapPaymentIntentStatus(paymentIntent.status);
        const statusTimestamps = this.buildStatusTimestamps(
            normalizedStatus,
            this.parseUnixTimestamp(paymentIntent.created) ?? new Date()
        );

        await this.upsertPayment(
            {
                stripe_payment_intent_id: paymentIntent.id,
                stripe_invoice_id: null,
            },
            {
                source: PaymentSource.PAYMENT_INTENT,
                user_id: userId,
                subscription_id: null,
                stripe_subscription_id: null,
                customer_id: customerId,
                amount: paymentIntent.amount,
                amount_received: paymentIntent.amount_received,
                quantity: paymentIntent.metadata.quantity ? Number(paymentIntent.metadata.quantity) : null,
                currency: paymentIntent.currency,
                status: normalizedStatus,
                payment_method_type: paymentIntent.payment_method_types[0] ?? null,
                price: stripeMappers.toStripePrice(price),
                ...statusTimestamps,
                failure_message: paymentIntent.last_payment_error?.message ?? null,
                receipt_url: null,
            }
        );
    }

    static async updatePayment(
        paymentIntent: Stripe.PaymentIntent,
        forcedStatus?: PaymentStatus
    ) {
        const existingPayment = await paymentRepository.getPayment({
            stripe_payment_intent_id: paymentIntent.id
        });

        const customerId = typeof paymentIntent.customer === 'string' ? paymentIntent.customer : null;
        const userId = await this.resolveUserId(
            customerId,
            paymentIntent.metadata.userId ? Number(paymentIntent.metadata.userId) : existingPayment?.get().user_id,
        );

        if (!userId) {
            throw new AppError(
                `Could not resolve user for payment intent ${paymentIntent.id}.`,
                404,
                ErrorTypes.NOT_FOUND
            );
        }

        const normalizedStatus = forcedStatus ?? this.mapPaymentIntentStatus(paymentIntent.status);
        const statusTimestamps = this.buildStatusTimestamps(normalizedStatus);

        let mappedPrice = existingPayment?.get().price ?? null;
        if (!mappedPrice && paymentIntent.metadata.priceId) {
            const price = await StripeService.getPriceById(paymentIntent.metadata.priceId);
            mappedPrice = stripeMappers.toStripePrice(price);
        }

        await this.upsertPayment(
            {
                stripe_payment_intent_id: paymentIntent.id,
                stripe_invoice_id: existingPayment?.get().stripe_invoice_id ?? null,
            },
            {
                source: existingPayment?.get().source ?? PaymentSource.PAYMENT_INTENT,
                user_id: userId,
                subscription_id: existingPayment?.get().subscription_id ?? null,
                stripe_subscription_id: existingPayment?.get().stripe_subscription_id ?? null,
                customer_id: customerId,
                amount: paymentIntent.amount,
                amount_received: paymentIntent.amount_received,
                quantity: paymentIntent.metadata.quantity
                    ? Number(paymentIntent.metadata.quantity)
                    : (existingPayment?.get().quantity ?? null),
                currency: paymentIntent.currency,
                status: normalizedStatus,
                payment_method_type: paymentIntent.payment_method_types[0] ?? existingPayment?.get().payment_method_type ?? null,
                price: mappedPrice,
                paid_at: normalizedStatus === PaymentStatus.SUCCEEDED
                    ? (existingPayment?.get().paid_at ?? statusTimestamps.paid_at)
                    : existingPayment?.get().paid_at ?? null,
                failed_at: normalizedStatus === PaymentStatus.FAILED
                    ? (existingPayment?.get().failed_at ?? statusTimestamps.failed_at)
                    : existingPayment?.get().failed_at ?? null,
                canceled_at: normalizedStatus === PaymentStatus.CANCELED
                    ? (existingPayment?.get().canceled_at ?? statusTimestamps.canceled_at)
                    : existingPayment?.get().canceled_at ?? null,
                failure_message: paymentIntent.last_payment_error?.message ?? existingPayment?.get().failure_message ?? null,
                receipt_url: existingPayment?.get().receipt_url ?? null,
            }
        );
    }

    // Upserted by Stripe IDs: invoice events can retry and arrive out of order.
    @handleServiceError("Failed to create payment record from invoice.")
    static async createPaymentFromInvoice(
        invoice: Stripe.Invoice,
        forcedStatus?: PaymentStatus
    ) {
        const stripeInvoiceId = invoice.id ?? null;
        if (!stripeInvoiceId) {
            throw new AppError(
                "Invoice payload has no id.",
                400,
                ErrorTypes.BAD_REQUEST
            );
        }

        const invoicePayment = invoice.payments?.data[0]?.payment;
        const paymentIntentId = typeof invoicePayment?.payment_intent === 'string'
            ? invoicePayment.payment_intent
            : (invoicePayment?.payment_intent?.id ?? null);

        const paymentIntent = paymentIntentId
            ? await stripe.paymentIntents.retrieve(paymentIntentId)
            : null;

        const priceId = invoice.lines.data[0]?.pricing?.price_details?.price ?? null;
        const stripePrice = priceId
            ? await StripeService.getPriceById(priceId)
            : null;

        const subscriptionId = invoice.parent?.subscription_details?.subscription;
        const stripeSubscriptionId = typeof subscriptionId === 'string'
            ? subscriptionId
            : (subscriptionId?.id ?? null);

        let userId: number | undefined = paymentIntent?.metadata?.userId
            ? Number(paymentIntent.metadata.userId)
            : undefined;
        let localSubscriptionId: number | null = null;
        if (stripeSubscriptionId) {
            const subscription = await subscriptionRepository.getSubscription({
                stripe_subscription_id: stripeSubscriptionId
            });
            userId = subscription?.get().user_id ?? userId;
            localSubscriptionId = subscription?.get().id ?? null;
        }

        if (!userId && typeof invoice.customer === 'string') {
            const user = await userRepository.getUserByFields({
                stripeCustomerId: invoice.customer
            });
            userId = user?.get().id;
        }

        if (!userId) {
            throw new AppError(
                "Could not resolve user for invoice payment.",
                404,
                ErrorTypes.NOT_FOUND
            );
        }

        const normalizedStatus = forcedStatus
            ?? (invoice.status === 'paid'
                ? PaymentStatus.SUCCEEDED
                : (paymentIntent
                    ? this.mapPaymentIntentStatus(paymentIntent.status)
                    : PaymentStatus.PENDING));

        const eventDate = this.parseUnixTimestamp(invoice.status_transitions.paid_at)
            ?? this.parseUnixTimestamp(invoice.status_transitions.finalized_at)
            ?? this.parseUnixTimestamp(invoice.created)
            ?? new Date();

        const existingPayment = await this.findExistingPaymentByStripeIdentifiers(
            paymentIntentId,
            stripeInvoiceId
        );

        const statusTimestamps = this.buildStatusTimestamps(normalizedStatus, eventDate);
        const effectivePaymentIntentId = paymentIntentId ?? existingPayment?.get().stripe_payment_intent_id ?? null;
        const effectiveAmount = paymentIntent?.amount
            ?? invoice.amount_due
            ?? existingPayment?.get().amount
            ?? 0;
        const effectiveCurrency = paymentIntent?.currency
            ?? invoice.currency
            ?? existingPayment?.get().currency;

        if (!effectiveCurrency) {
            throw new AppError(
                `Could not resolve currency for invoice ${invoice.id}.`,
                400,
                ErrorTypes.BAD_REQUEST
            );
        }

        const paymentFields: Omit<PaymentCreationAttributes, 'stripe_payment_intent_id' | 'stripe_invoice_id'> = {
            source: PaymentSource.INVOICE,
            user_id: userId,
            subscription_id: localSubscriptionId,
            stripe_subscription_id: stripeSubscriptionId,
            customer_id: typeof invoice.customer === 'string' ? invoice.customer : null,
            amount: effectiveAmount,
            amount_received: paymentIntent?.amount_received ?? existingPayment?.get().amount_received ?? null,
            quantity: existingPayment?.get().quantity ?? null,
            currency: effectiveCurrency,
            status: normalizedStatus,
            payment_method_type: paymentIntent?.payment_method_types[0]
                ?? existingPayment?.get().payment_method_type
                ?? null,
            price: stripePrice
                ? stripeMappers.toStripePrice(stripePrice)
                : (existingPayment?.get().price ?? null),
            paid_at: normalizedStatus === PaymentStatus.SUCCEEDED
                ? (existingPayment?.get().paid_at ?? statusTimestamps.paid_at)
                : existingPayment?.get().paid_at ?? null,
            failed_at: normalizedStatus === PaymentStatus.FAILED
                ? (existingPayment?.get().failed_at ?? statusTimestamps.failed_at)
                : existingPayment?.get().failed_at ?? null,
            canceled_at: normalizedStatus === PaymentStatus.CANCELED
                ? (existingPayment?.get().canceled_at ?? statusTimestamps.canceled_at)
                : existingPayment?.get().canceled_at ?? null,
            failure_message: paymentIntent?.last_payment_error?.message
                ?? existingPayment?.get().failure_message
                ?? null,
            receipt_url: existingPayment?.get().receipt_url ?? null,
        };

        await this.upsertPayment(
            {
                stripe_payment_intent_id: effectivePaymentIntentId,
                stripe_invoice_id: stripeInvoiceId,
            },
            paymentFields
        );
    }

    static async getUserPayments(user_id: number) {
        const payments = await paymentRepository.getPayments({ user_id: user_id })
        return payments.map((payment) => payment.toSafePayment());
    }

    static async getPayment(stripePaymentIntentId: string) {
        const payment = await paymentRepository.getPayment({
            stripe_payment_intent_id: stripePaymentIntentId
        })
        return payment
    }

    @handleServiceError("Failed to delete user payments")
    static async deleteUserPayments(user_id: number) {
        const deletedCount = await paymentRepository.deleteUserPayments(user_id);
        return deletedCount;
    }

}
