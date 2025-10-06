import { Optional } from "sequelize";
import { Payment_Interval } from "./payments";

export enum SubscriptionStatus {
    ACTIVE = 'Active',
    CANCELED = 'Canceled',
    PAUSED = 'Paused',
    EXPIRED = 'Expired',
}

export interface SubscriptionAttributes {
    id: number;
    public_id: string;
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

export interface SubscriptionCreationAttributs extends Optional<SubscriptionAttributes,
    'auto_renew' | 'createdAt' | 'updatedAt' | 'id' | 'public_id'
> {}

export interface PublicSubscriptionData {
    subscription_id: string;
    plan_id: string;
    status: SubscriptionStatus;
    current_period_start: Date;
    current_period_end: Date;
    billing_interval: Payment_Interval;
    billing_interval_count: number;
    auto_renew: boolean;
}