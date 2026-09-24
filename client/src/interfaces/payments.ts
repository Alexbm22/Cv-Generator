import { StripePrice } from "./stripe";

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

export enum Payment_Interval {
  day = 'day',
  week = 'week',
  month = 'month',
  year = 'year',
}

  export enum PaymentSource {
    PAYMENT_INTENT = 'payment_intent',
    INVOICE = 'invoice',
  }

export interface PaymentAttributes {
  payment_id?: string | null;
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
    paid_at: Date | string | null;
    failed_at: Date | string | null;
    canceled_at: Date | string | null;
    failure_message: string | null;
    receipt_url: string | null;
    createdAt: Date | string;
}