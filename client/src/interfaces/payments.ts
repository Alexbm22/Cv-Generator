import { StripePrice } from "./stripe";

export enum PaymentStatus {
    CANCELED = 'canceled',
    SUCCEEDED = 'succeeded',
    PROCESSING = 'processing',
    REQUIRES_ACTION = 'requires_action',
    REQUIRES_CAPTURE = 'requires_capture',
    REQUIRES_CONFIRMATION = 'requires_confirmation',
    REQUIRES_PAYMENT_METHOD = 'requires_payment_method',
}

export enum Payment_Interval {
  day = 'day',
  week = 'week',
  month = 'month',
  year = 'year',
}

export interface PaymentAttributes {
    payment_id: string;
    amount: number;
    quantity?: number;
    currency: string;
    status: PaymentStatus;
    payment_method_type?: string;
    price: StripePrice;
    failure_message?: string;
    receipt_url?: string;
}