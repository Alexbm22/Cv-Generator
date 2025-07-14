
export enum SubscriptionStatus {
    ACTIVE = 'Active',
    CANCELED = 'Canceled',
    PAUSED = 'Paused',
    EXPIRED = 'Expired',
}

export enum BillingInterval {
    DAY = 'day',
    WEEK = 'week',
    MONTH = 'month',
    YEAR = 'year',
}

export interface SubscriptionAttributes {
    subscription_id: number;
    payment_id: string;
    user_id: number;
    plan_id: string;
    status: SubscriptionStatus;
    current_period_start: Date;
    current_period_end: Date;
    billing_interval: BillingInterval;
    billing_interval_count: number;
    next_billing_date: Date;
    auto_renew: boolean;
    createdAt: Date;
    updatedAt: Date;
}