import { Payment_Interval } from "./payments";

export enum SubscriptionStatus {
    ACTIVE = 'Active',
    CANCELED = 'Canceled',
    PAUSED = 'Paused',
    EXPIRED = 'Expired',
}

export interface SubscriptionAttributes {
    subscription_id: string;
    plan_id: string;
    status: SubscriptionStatus;
    current_period_start: Date;
    current_period_end: Date;
    billing_interval: Payment_Interval;
    billing_interval_count: number;
    auto_renew: boolean;
}