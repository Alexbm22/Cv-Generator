import { Optional } from "sequelize";
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
    id: number;
    public_id: string;
    stripe_subscription_id: string | null;
    stripe_schedule_id: string | null;
    user_id: number;
    plan_id: string;
    status: SubscriptionStatus;
    current_period_start: Date;
    current_period_end: Date;
    cancel_at_period_end: boolean;
    cancel_at: Date | null;
    canceled_at: Date | null;
    ended_at: Date | null;
    billing_interval: Payment_Interval;
    billing_interval_count: number;
    auto_renew: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface SubscriptionCreationAttributs extends Optional<SubscriptionAttributes,
    | 'auto_renew'
    | 'createdAt'
    | 'updatedAt'
    | 'id'
    | 'public_id'
    | 'stripe_schedule_id'
    | 'cancel_at_period_end'
    | 'cancel_at'
    | 'canceled_at'
    | 'ended_at'
> {}

export interface PublicSubscriptionData {
    subscription_id: string;
    stripe_subscription_id: string | null;
    plan_id: string;
    status: SubscriptionStatus;
    current_period_start: Date;
    current_period_end: Date;
    cancel_at_period_end: boolean;
    cancel_at: Date | null;
    canceled_at: Date | null;
    ended_at: Date | null;
    billing_interval: Payment_Interval;
    billing_interval_count: number;
    auto_renew: boolean;
    has_cancellation_requested: boolean;
    will_renew: boolean;
    has_benefits: boolean;
    benefits_expires_at: Date | null;
}