import Stripe from "stripe";
import { Subscription } from "@/models";
import { PublicSubscriptionData, SubscriptionStatus } from "@/interfaces/subscriptions";
import { Payment_Interval } from "@/interfaces/payments";
import { AppError } from "@/middleware/error_middleware";
import { ErrorTypes } from "@/interfaces/error";
import { paymentRepository, subscriptionRepository, userRepository } from "@/repositories";
import { handleServiceError } from '../utils/serviceErrorHandler';

export class SubscriptionService {
    private static mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
        switch (status) {
            case 'incomplete':
                return SubscriptionStatus.INCOMPLETE;
            case 'incomplete_expired':
                return SubscriptionStatus.INCOMPLETE_EXPIRED;
            case 'trialing':
                return SubscriptionStatus.TRIALING;
            case 'active':
                return SubscriptionStatus.ACTIVE;
            case 'past_due':
                return SubscriptionStatus.PAST_DUE;
            case 'canceled':
                return SubscriptionStatus.CANCELED;
            case 'unpaid':
                return SubscriptionStatus.UNPAID;
            case 'paused':
                return SubscriptionStatus.PAUSED;
            default:
                return SubscriptionStatus.INCOMPLETE;
        }
    }

    private static toDate(value?: number | null): Date | null {
        return value ? new Date(value * 1000) : null;
    }

    private static isStatusEntitled(status: SubscriptionStatus): boolean {
        return [
            SubscriptionStatus.ACTIVE,
            SubscriptionStatus.TRIALING,
            SubscriptionStatus.PAST_DUE,
            SubscriptionStatus.UNPAID,
        ].includes(status);
    }

    private static hasBenefits(subscription: Subscription, at: Date = new Date()): boolean {
        const data = subscription.get();

        if (data.ended_at && data.ended_at <= at) {
            return false;
        }

        if (data.current_period_end <= at) {
            return false;
        }

        return this.isStatusEntitled(data.status);
    }

    private static async linkPaymentsToSubscription(localSubscription: Subscription): Promise<void> {
        const data = localSubscription.get();
        if (!data.stripe_subscription_id) {
            return;
        }

        try {
            await paymentRepository.updatePaymentByFields(
                { subscription_id: data.id },
                {
                    stripe_subscription_id: data.stripe_subscription_id,
                    subscription_id: null,
                },
                { validate: false }
            );
        } catch (error) {
            console.error('Failed to link payments to subscription:', error);
        }
    }

    private static buildSubscriptionPayload(
        stripeSubscription: Stripe.Subscription,
        userId: number,
    ) {
        const item = stripeSubscription.items.data[0];
        if (!item?.price?.recurring) {
            throw new AppError(
                'Stripe subscription does not include a recurring price item.',
                400,
                ErrorTypes.BAD_REQUEST
            );
        }

        const status = this.mapStripeStatus(stripeSubscription.status);
        const endedAt = this.toDate(stripeSubscription.ended_at);

        return {
            stripe_subscription_id: stripeSubscription.id,
            stripe_schedule_id: typeof stripeSubscription.schedule === 'string'
                ? stripeSubscription.schedule
                : stripeSubscription.schedule?.id ?? null,
            plan_id: item.price.id,
            user_id: userId,
            status,
            current_period_start: new Date(item.current_period_start * 1000),
            current_period_end: new Date(item.current_period_end * 1000),
            cancel_at_period_end: stripeSubscription.cancel_at_period_end,
            cancel_at: this.toDate(stripeSubscription.cancel_at),
            canceled_at: this.toDate(stripeSubscription.canceled_at),
            ended_at: endedAt,
            billing_interval: item.price.recurring.interval as Payment_Interval,
            billing_interval_count: item.price.recurring.interval_count ?? 1,
            auto_renew: this.isStatusEntitled(status)
                && !stripeSubscription.cancel_at_period_end
                && !stripeSubscription.cancel_at
                && !endedAt,
        };
    }

    // Raw model (exposes stripe_subscription_id / stripe_schedule_id) for server-side Stripe calls;
    // use getUserSubscription() for anything returned to the client.
    static async getEntitledSubscription(userId: number): Promise<Subscription | null> {
        const userSubscriptions = await Subscription.findAll({
            where: { user_id: userId },
            order: [['current_period_end', 'DESC']],
        });

        return userSubscriptions.find(subscription => this.hasBenefits(subscription)) ?? null;
    }

    static async getUserSubscription(userId: number): Promise<PublicSubscriptionData | null> {
        const entitledSubscription = await this.getEntitledSubscription(userId);
        return entitledSubscription ? entitledSubscription.toSafeSubscription() : null;
    }

    @handleServiceError('Failed to create subscription')
    static async createSubscriptionFromStripe(
        stripeSubscription: Stripe.Subscription,
        userId: number
    ) {
        return await this.syncSubscriptionFromStripe(stripeSubscription, userId);
    }

    @handleServiceError('Failed to sync subscription from Stripe')
    static async syncSubscriptionFromStripe(
        stripeSubscription: Stripe.Subscription,
        explicitUserId?: number
    ) {
        const existingSubscription = await subscriptionRepository.getSubscription({
            stripe_subscription_id: stripeSubscription.id
        });

        let userId = explicitUserId ?? existingSubscription?.get().user_id;
        if (!userId && typeof stripeSubscription.customer === 'string') {
            const user = await userRepository.getUserByFields({
                stripeCustomerId: stripeSubscription.customer
            });
            userId = user?.get().id;
        }

        if (!userId) {
            throw new AppError(
                `Cannot resolve user for Stripe subscription ${stripeSubscription.id}.`,
                404,
                ErrorTypes.NOT_FOUND
            );
        }

        const payload = this.buildSubscriptionPayload(stripeSubscription, userId);

        if (existingSubscription) {
            await subscriptionRepository.updateSubscriptionByFields(
                payload,
                { stripe_subscription_id: stripeSubscription.id }
            );
        } else {
            await subscriptionRepository.createSubscription(payload);
        }

        const syncedSubscription = await subscriptionRepository.getSubscription({
            stripe_subscription_id: stripeSubscription.id
        });


        if (syncedSubscription) {
            await this.linkPaymentsToSubscription(syncedSubscription);
        }

        return syncedSubscription;
    }

    @handleServiceError('Failed to delete user subscriptions')
    static async deleteUserSubscriptions(user_id: number) {
        const deletedCount = await subscriptionRepository.deleteUserSubscriptions(user_id);
        return deletedCount;
    }
}
