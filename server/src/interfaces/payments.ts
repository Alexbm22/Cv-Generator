import Stripe from "stripe";
import { StripePrice } from "./stripe";
import { Optional } from "sequelize";

export enum Payment_Interval {
  day = 'day',
  week = 'week',
  month = 'month',
  year = 'year',
}

export enum PaymentStatus {
    CANCELED = 'canceled',
    SUCCEEDED = 'succeeded',
    PROCESSING = 'processing',
    REQUIRES_ACTION = 'requires_action',
    REQUIRES_CAPTURE = 'requires_capture',
    REQUIRES_CONFIRMATION = 'requires_confirmation',
    REQUIRES_PAYMENT_METHOD = 'requires_payment_method',
}

export interface PaymentAttributes {
    id: number;
    payment_id: string;
    user_id: number;
    customer_id: string | null;
    amount: number;
    amount_received?: number;
    quantity?: number;
    currency: string;
    status: Stripe.PaymentIntent.Status;
    payment_method_type?: string;
    price: StripePrice;
    failure_message?: string;
    receipt_url?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface PaymentCreationAttributes extends Optional<PaymentAttributes, 
    'amount_received' | 'payment_method_type' | 'createdAt' | 'updatedAt' | 'id'
> {}

export interface PublicPaymentData {
    payment_id: string;
    amount: number;
    quantity?: number;
    currency: string;
    status: Stripe.PaymentIntent.Status;
    payment_method_type?: string;
    price: StripePrice;
    failure_message?: string;
    receipt_url?: string;
}