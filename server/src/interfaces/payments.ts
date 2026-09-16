import { StripePrice } from "./stripe";
import { Optional } from "sequelize";

export enum Payment_Interval {
  day = 'day',
  week = 'week',
  month = 'month',
  year = 'year',
}

export enum PaymentStatus {
    PENDING = 'pending',
    FAILED = 'failed',
    CANCELED = 'canceled',
    SUCCEEDED = 'succeeded',
    PROCESSING = 'processing',
    REQUIRES_ACTION = 'requires_action',
    REQUIRES_CAPTURE = 'requires_capture',
    REQUIRES_CONFIRMATION = 'requires_confirmation',
    REQUIRES_PAYMENT_METHOD = 'requires_payment_method',
}

export enum PaymentSource {
    PAYMENT_INTENT = 'payment_intent',
    INVOICE = 'invoice',
}

export interface PaymentAttributes {
    id: number;
    stripe_payment_intent_id: string | null;
    stripe_invoice_id: string | null;
    stripe_subscription_id: string | null;
    source: PaymentSource;
    user_id: number;
    subscription_id: number | null;
    customer_id: string | null;
    amount: number;
    amount_received: number | null;
    quantity: number | null;
    currency: string;
    status: PaymentStatus;
    payment_method_type: string | null;
    price: StripePrice | null;
    paid_at: Date | null;
    failed_at: Date | null;
    canceled_at: Date | null;
    failure_message: string | null;
    receipt_url: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface PaymentCreationAttributes extends Optional<PaymentAttributes, 
    | 'createdAt'
    | 'updatedAt'
    | 'id'
    | 'subscription_id'
    | 'stripe_payment_intent_id'
    | 'stripe_invoice_id'
    | 'stripe_subscription_id'
    | 'amount_received'
    | 'quantity'
    | 'payment_method_type'
    | 'price'
    | 'paid_at'
    | 'failed_at'
    | 'canceled_at'
    | 'failure_message'
    | 'receipt_url'
> {}

export interface PublicPaymentData {
    stripe_payment_intent_id: string | null;
    stripe_invoice_id: string | null;
    stripe_subscription_id: string | null;
    source: PaymentSource;
    amount: number;
    amount_received: number | null;
    quantity: number | null;
    currency: string;
    status: PaymentStatus;
    payment_method_type: string | null;
    price: StripePrice | null;
    paid_at: Date | null;
    failed_at: Date | null;
    canceled_at: Date | null;
    failure_message: string | null;
    receipt_url: string | null;
}