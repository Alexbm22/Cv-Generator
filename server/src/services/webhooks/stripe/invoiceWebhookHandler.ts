import Stripe from "stripe";
import { stripe } from "@/app";
import { PaymentStatus } from "@/interfaces/payments";
import { PaymentService } from "@/services/payments";
import { SubscriptionService } from "@/services/subscriptions";

const syncSubscriptionFromInvoice = async (invoice: Stripe.Invoice): Promise<void> => {
    const subscriptionId = invoice.parent?.subscription_details?.subscription;
    const stripeSubscriptionId = typeof subscriptionId === 'string'
        ? subscriptionId
        : subscriptionId?.id;

    if (!stripeSubscriptionId) {
        return;
    }

    const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    await SubscriptionService.syncSubscriptionFromStripe(stripeSubscription);
};

const maybeSetDefaultPaymentMethod = async (invoice: Stripe.Invoice): Promise<void> => {
    if (invoice.billing_reason !== 'subscription_create') {
        return;
    }

    const invoicePayment = invoice.payments?.data[0]?.payment;
    const paymentIntentId = typeof invoicePayment?.payment_intent === 'string'
        ? invoicePayment.payment_intent
        : invoicePayment?.payment_intent?.id;

    const customerId = typeof invoice.customer === 'string' ? invoice.customer : null;
    if (!paymentIntentId || !customerId) {
        return;
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (!paymentIntent.payment_method) {
        return;
    }

    await stripe.customers.update(customerId, {
        invoice_settings: {
            default_payment_method: paymentIntent.payment_method as string,
        },
    });
};

export const handleInvoiceEvent = async (event: Stripe.Event): Promise<void> => {
    const invoice = event.data.object as Stripe.Invoice;

    switch (event.type) {
        case 'invoice.paid':
        case 'invoice.payment_succeeded':
            await PaymentService.createPaymentFromInvoice(invoice, PaymentStatus.SUCCEEDED);
            await syncSubscriptionFromInvoice(invoice);
            await maybeSetDefaultPaymentMethod(invoice);
            break;
        case 'invoice.payment_failed':
            await PaymentService.createPaymentFromInvoice(invoice, PaymentStatus.FAILED);
            await syncSubscriptionFromInvoice(invoice);
            break;
        default:
            console.log(`Unhandled invoice event type ${event.type}`);
            break;
    }
};
