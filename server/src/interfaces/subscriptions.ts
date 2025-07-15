import { Payment_Interval } from "./stripe";

export enum SubscriptionStatus {
    ACTIVE = 'Active',
    CANCELED = 'Canceled',
    PAUSED = 'Paused',
    EXPIRED = 'Expired',
}

export interface SubscriptionAttributes {
    subscription_id: number;
    payment_id: string;
    user_id: number;
    plan_id: string;
    status: SubscriptionStatus;
    current_period_start: Date;
    current_period_end: Date;
    billing_interval: Payment_Interval;
    billing_interval_count: number;
    auto_renew: boolean;
    createdAt: Date;
    updatedAt: Date;
}