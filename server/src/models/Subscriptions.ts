import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/DB/database_config';
import {
    SubscriptionAttributes,
    SubscriptionStatus
} from '../interfaces/subscriptions'; 
import { Payment_Interval } from '../interfaces/stripe';

interface SubscriptionCreationAttributs extends Optional<SubscriptionAttributes,
    'subscription_id'| 'auto_renew' | 'createdAt' | 'updatedAt'
> {}

class Subscriptions extends Model<SubscriptionAttributes, SubscriptionCreationAttributs> implements SubscriptionAttributes{
    public subscription_id!: number;
    public payment_id!: string;
    public plan_id!: string;
    public user_id!: number;
    public status!: SubscriptionStatus;
    public current_period_start!: Date;
    public current_period_end!: Date;
    public billing_interval!: Payment_Interval;
    public billing_interval_count!: number;
    public auto_renew!: boolean;
    public createdAt!: Date;
    public updatedAt!: Date;
}

Subscriptions.init({
    subscription_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        unique: true,
        allowNull: false,
        primaryKey: true,
    },
    payment_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
    },
    plan_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: 'user',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM(...Object.values(SubscriptionStatus)),
        allowNull: false,
    },
    current_period_start: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    current_period_end: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    billing_interval: {
        type: DataTypes.ENUM(...Object.values(Payment_Interval)),
        allowNull: false,
    },
    billing_interval_count: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    auto_renew: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
},{
    sequelize,
    tableName: 'Subscriptions',
    timestamps: true,
    underscored: true,
});

export default Subscriptions;