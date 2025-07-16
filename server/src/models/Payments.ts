import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/DB/database_config';
import { 
    PaymentAttributes, 
    PaymentStatus,
    PublicPaymentData
} from '../interfaces/payments';
import Stripe from 'stripe';
import { StripePrice } from '../interfaces/stripe';
import { AppError } from '../middleware/error_middleware';
import { ErrorTypes } from '../interfaces/error';

interface PaymentCreationAttributes extends Optional<PaymentAttributes, 
    'amount_received' | 'payment_method_type' | 'createdAt' | 'updatedAt'
> {}

export class Payments extends Model<
    PaymentAttributes, 
    PaymentCreationAttributes
> implements PaymentAttributes {
    public payment_id!: string;
    public user_id!: number;
    public customer_id!: string | null;
    public amount!: number;
    public amount_received!: number;
    public quantity!: number;
    public currency!: string;
    public status!: Stripe.PaymentIntent.Status;
    public payment_method_type?: string;
    public price!: StripePrice;
    public failure_message?: string;
    public receipt_url?: string;
    public createdAt!: Date;
    public updatedAt!: Date;

    public toSafePayment(): PublicPaymentData {
        const {
            payment_id,
            quantity,
            amount,
            currency,
            status,
            payment_method_type,
            price,
            failure_message,
            receipt_url
        } = this.get()

        return {
            payment_id,
            quantity,
            amount,
            currency,
            status,
            payment_method_type,
            price,
            failure_message,
            receipt_url
        }
    }
}

Payments.init({
    payment_id: {
        type: DataTypes.STRING(255),
        primaryKey: true,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: 'user',
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
        allowNull: false,
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
    tableName: 'payments',
    timestamps: true,
    underscored: true,
    hooks: {
        beforeCreate: (payment: Payments) => {
            
            const quantity = payment.getDataValue('quantity');
            const priceType = payment.getDataValue('price')?.type;

            if(
                (quantity === undefined && priceType === 'one_time') || 
                (quantity !== undefined && priceType === 'recurring')
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