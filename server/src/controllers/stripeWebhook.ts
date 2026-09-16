import Stripe from "stripe";
import { handleCustomerSubscriptionEvent } from "@/services/webhooks/stripe/customerSubscriptionWebhookHandler";
import { handleInvoiceEvent } from "@/services/webhooks/stripe/invoiceWebhookHandler";
import { handlePaymentIntentEvent } from "@/services/webhooks/stripe/paymentIntentWebhookHandler";
import { handleSubscriptionScheduleEvent } from "@/services/webhooks/stripe/subscriptionScheduleWebhookHandler";

type EventHandler = (event: Stripe.Event) => Promise<void>;

type PrefixedHandler = {
    prefix: string;
    handler: EventHandler;
};

const prefixedHandlers: PrefixedHandler[] = [
    { prefix: 'payment_intent', handler: handlePaymentIntentEvent },
    { prefix: 'invoice', handler: handleInvoiceEvent },
    { prefix: 'customer.subscription', handler: handleCustomerSubscriptionEvent },
    { prefix: 'subscription_schedule', handler: handleSubscriptionScheduleEvent },
];

export class StripeWebhookController {
    static async handleEvent(event: Stripe.Event): Promise<void> {
        const matchedHandler = prefixedHandlers.find(({ prefix }) => event.type.startsWith(prefix));

        if (!matchedHandler) {
            console.log(`Unhandled event type ${event.type}`);
            console.log(event.data.object);
            return;
        }

        await matchedHandler.handler(event);
    }
}
