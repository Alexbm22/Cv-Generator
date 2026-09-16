import Stripe from "stripe";
import { stripe } from "@/app";
import { SubscriptionService } from "@/services/subscriptions";

export const handleSubscriptionScheduleEvent = async (event: Stripe.Event): Promise<void> => {
    switch (event.type) {
        case 'subscription_schedule.updated':
        case 'subscription_schedule.released': {
            const schedule = event.data.object as Stripe.SubscriptionSchedule;
            const scheduleSubscriptionId = typeof schedule.subscription === 'string'
                ? schedule.subscription
                : schedule.subscription?.id;

            if (scheduleSubscriptionId) {
                const stripeSubscription = await stripe.subscriptions.retrieve(scheduleSubscriptionId);
                await SubscriptionService.syncSubscriptionFromStripe(stripeSubscription);
            }
            break;
        }
        default:
            console.log(`Unhandled subscription_schedule event type ${event.type}`);
            break;
    }
};
