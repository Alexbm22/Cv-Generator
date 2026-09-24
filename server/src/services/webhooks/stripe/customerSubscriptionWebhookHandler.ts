import Stripe from "stripe";
import { SubscriptionService } from "@/services/subscriptions";

export const handleCustomerSubscriptionEvent = async (
  event: Stripe.Event,
): Promise<void> => {
  switch (event.type) {
    case "customer.subscription.created": {
      const subscription = event.data.object as Stripe.Subscription;
      await SubscriptionService.syncSubscriptionFromStripe(subscription);
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await SubscriptionService.syncSubscriptionFromStripe(
        event.data.object as Stripe.Subscription,
      );
      break;
    default:
      console.log(`Unhandled customer.subscription event type ${event.type}`);
      break;
  }
};
