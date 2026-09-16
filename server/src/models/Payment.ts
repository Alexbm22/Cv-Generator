import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/DB/database_config';
import { 
    PaymentAttributes, 
    PaymentCreationAttributes, 
    PaymentStatus,
    PaymentSource,
    PublicPaymentData
} from '../interfaces/payments';
import { StripePrice } from '../interfaces/stripe';
import { AppError } from '../middleware/error_middleware';
import { ErrorTypes } from '../interfaces/error';



class Payments extends Model<
    PaymentAttributes, 
    PaymentCreationAttributes
> implements PaymentAttributes {
    public id!: number
    public stripe_payment_intent_id!: string | null;
    public stripe_invoice_id!: string | null;
    public stripe_subscription_id!: string | null;
    public source!: PaymentSource;
    public user_id!: number;
    public subscription_id!: number | null;
    public customer_id!: string | null;
    public amount!: number;
    public amount_received!: number | null;
    public quantity!: number | null;
    public currency!: string;
    public status!: PaymentStatus;
    public payment_method_type!: string | null;
    public price!: StripePrice | null;
    public paid_at!: Date | null;
    public failed_at!: Date | null;
    public canceled_at!: Date | null;
    public failure_message!: string | null;
    public receipt_url!: string | null;
    public createdAt!: Date;
    public updatedAt!: Date;

    public toSafePayment(): PublicPaymentData {
        const {
            stripe_payment_intent_id,
            stripe_invoice_id,
            stripe_subscription_id,
            source,
            quantity,
            amount,
            amount_received,
            currency,
            status,
            payment_method_type,
            price,
            paid_at,
            failed_at,
            canceled_at,
            failure_message,
            receipt_url
        } = this.get()

        return {
            stripe_payment_intent_id,
            stripe_invoice_id,
            stripe_subscription_id,
            source,
            quantity,
            amount,
            amount_received,
            currency,
            status,
            payment_method_type,
            price,
            paid_at,
            failed_at,
            canceled_at,
            failure_message,
            receipt_url
        }
    }
}

Payments.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    stripe_payment_intent_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
    },
    stripe_invoice_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
    },
    stripe_subscription_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    source: {
        type: DataTypes.ENUM(...Object.values(PaymentSource)),
        allowNull: false,
        defaultValue: PaymentSource.PAYMENT_INTENT,
    },
    user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    subscription_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
            model: 'subscriptions',
            key: 'id'
        }
    },
    customer_id: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    amount: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
    },
    amount_received: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true
    },
    quantity: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true 
    },
    currency: {
        type: DataTypes.STRING(3),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM(...Object.values(PaymentStatus)),
        allowNull: false
    },
    payment_method_type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    price: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    paid_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    failed_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    canceled_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    failure_message: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    receipt_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    }
}, {
    sequelize,
    tableName: 'Payment',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['stripe_payment_intent_id'],
        },
        {
            unique: true,
            fields: ['stripe_invoice_id'],
        },
        {
            fields: ['stripe_subscription_id'],
        },
        {
            fields: ['user_id', 'created_at'],
        },
        {
            fields: ['subscription_id', 'created_at'],
        },
        {
            fields: ['status'],
        },
    ],
    hooks: {
        beforeValidate: (payment: Payments) => {
            const stripePaymentIntentId = payment.getDataValue('stripe_payment_intent_id');
            const stripeInvoiceId = payment.getDataValue('stripe_invoice_id');
            const source = payment.getDataValue('source');

            if (!stripePaymentIntentId && !stripeInvoiceId) {
                throw new AppError(
                    'Payment must include at least one Stripe identifier.',
                    400,
                    ErrorTypes.BAD_REQUEST
                )
            }

            if (source === PaymentSource.INVOICE && !stripeInvoiceId) {
                throw new AppError(
                    'Invoice payments require stripe_invoice_id.',
                    400,
                    ErrorTypes.BAD_REQUEST
                )
            }

            if (source === PaymentSource.PAYMENT_INTENT && !stripePaymentIntentId) {
                throw new AppError(
                    'PaymentIntent payments require stripe_payment_intent_id.',
                    400,
                    ErrorTypes.BAD_REQUEST
                )
            }
            
            const quantity = payment.getDataValue('quantity');
            const priceType = payment.getDataValue('price')?.type;

            if(
                (quantity == null && priceType === 'one_time') || 
                (quantity != null && priceType === 'recurring')
            ) {
                throw new AppError(
                    'Invalid quantity for the price type.',
                    400,
                    ErrorTypes.BAD_REQUEST
                )
            }
        }
    }
})

export default Payments;