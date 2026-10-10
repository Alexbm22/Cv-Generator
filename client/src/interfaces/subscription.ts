import { Payment_Interval } from "./payments";

export enum SubscriptionStatus {
    INCOMPLETE = 'incomplete',
    INCOMPLETE_EXPIRED = 'incomplete_expired',
    TRIALING = 'trialing',
    ACTIVE = 'active',
    PAST_DUE = 'past_due',
    CANCELED = 'canceled',
    UNPAID = 'unpaid',
    PAUSED = 'paused',
}

export interface SubscriptionAttributes {
    subscription_id: string;
    stripe_subscription_id: string | null;
    plan_id: string;
    status: SubscriptionStatus;
    current_period_start: Date | string;
    current_period_end: Date | string;
    cancel_at_period_end: boolean;
    cancel_at: Date | string | null;
    canceled_at: Date | string | null;
    ended_at: Date | string | null;
    billing_interval: Payment_Interval;
    billing_interval_count: number;
    auto_renew: boolean;
    has_cancellation_requested: boolean;
    will_renew: boolean;
    has_benefits: boolean;
    benefits_expires_at: Date | string | null;
}