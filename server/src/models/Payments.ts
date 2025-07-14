import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/DB/database_config';
import { 
    PaymentAttributes, 
    PaymentStatus
} from '../interfaces/payments';

interface PaymentCreationAttributes extends Optional<PaymentAttributes, 
    'createdAt' | 'updatedAt'
> {}

export class Payments extends Model<
    PaymentAttributes, 
    PaymentCreationAttributes
> implements PaymentAttributes {
    public payment_id!: string;
    public user_id!: string;
    public customer_id!: string;
    public amount!: number;
    public currency!: string;
    public status!: PaymentStatus;
    public payment_method_type!: string;
    public description?: string;
    public failure_message?: string;
    public receipt_url?: string;
    public createdAt!: Date;
    public updatedAt!: Date;
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
        allowNull: false
    },
    amount: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
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
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
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
})