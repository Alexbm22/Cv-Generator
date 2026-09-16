import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/DB/database_config';
import {
    PublicSubscriptionData,
    SubscriptionAttributes,
    SubscriptionCreationAttributs,
    SubscriptionStatus
} from '../interfaces/subscriptions'; 
import { Payment_Interval } from '../interfaces/payments';
import { generateUUID } from '../utils/uuid';

class Subscription extends Model<SubscriptionAttributes, SubscriptionCreationAttributs> implements SubscriptionAttributes{
    public id!: number;
    public public_id!: string;
    public stripe_subscription_id!: string | null;
    public stripe_schedule_id!: string | null;
    public plan_id!: string;
    public user_id!: number;
    public status!: SubscriptionStatus;
    public current_period_start!: Date;
    public current_period_end!: Date;
    public cancel_at_period_end!: boolean;
    public cancel_at!: Date | null;
    public canceled_at!: Date | null;
    public ended_at!: Date | null;
    public billing_interval!: Payment_Interval;
    public billing_interval_count!: number;
    public auto_renew!: boolean;
    public createdAt!: Date;
    public updatedAt!: Date;

    public hasCancellationRequested(): boolean {
        return Boolean(this.cancel_at_period_end || this.canceled_at || this.cancel_at);
    }

    public willRenew(): boolean {
        return this.isEntitledStatus(this.status)
            && !this.cancel_at_period_end
            && !this.ended_at;
    }

    public hasBenefits(at: Date = new Date()): boolean {
        if (this.ended_at && this.ended_at <= at) {
            return false;
        }

        if (this.current_period_end <= at) {
            return false;
        }

        return this.isEntitledStatus(this.status);
    }

    public getBenefitsExpiry(): Date | null {
        if (this.ended_at) {
            return this.ended_at;
        }

        return this.current_period_end ?? null;
    }

    private isEntitledStatus(status: SubscriptionStatus): boolean {
        return [
            SubscriptionStatus.ACTIVE,
            SubscriptionStatus.TRIALING,
            SubscriptionStatus.PAST_DUE,
            SubscriptionStatus.UNPAID,
        ].includes(status);
    }

    public toSafeSubscription(): PublicSubscriptionData {
        const { 
            public_id: subscription_id,
            stripe_subscription_id,
            plan_id,
            status,
            current_period_start,
            current_period_end,
            cancel_at_period_end,
            cancel_at,
            canceled_at,
            ended_at,
            billing_interval, 
            billing_interval_count, 
            auto_renew
        } = this.get();
        
        return {
            subscription_id,
            stripe_subscription_id,
            plan_id,
            status,
            current_period_start,
            current_period_end,
            cancel_at_period_end,
            cancel_at,
            canceled_at,
            ended_at,
            billing_interval, 
            billing_interval_count, 
            auto_renew,
            has_cancellation_requested: this.hasCancellationRequested(),
            will_renew: this.willRenew(),
            has_benefits: this.hasBenefits(),
            benefits_expires_at: this.getBenefitsExpiry(),
        }
    }
}

Subscription.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        unique: true,
        allowNull: false,
        primaryKey: true,
    },
    public_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        defaultValue: () => generateUUID(),
    },
    stripe_subscription_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
    },
    stripe_schedule_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    plan_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: 'users',
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
    cancel_at_period_end: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    cancel_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    canceled_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    ended_at: {
        type: DataTypes.DATE,
        allowNull: true,
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
    tableName: 'subscriptions',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['stripe_subscription_id'],
        },
        {
            fields: ['user_id', 'status'],
        },
        {
            fields: ['user_id', 'current_period_end'],
        },
    ],
});

export default Subscription;