
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
    payment_id: string;
    user_id: string;
    customer_id: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    payment_method_type: string;
    description?: string;
    failure_message?: string;
    receipt_url?: string;
    createdAt: Date;
    updatedAt: Date;
}