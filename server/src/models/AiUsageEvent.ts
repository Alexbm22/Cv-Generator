import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/DB/database_config';
import { AI_USAGE_EVENTS_INDEXES } from '../config/DB/aiUsageSchema';
import { MODEL_TIERS, ModelTier } from '../ai/models.catalog';
import {
    AI_USAGE_OPERATIONS,
    AI_USAGE_STATUSES,
    AiUsageEventAttributes,
    AiUsageEventCreationAttributes,
    AiUsageOperation,
    AiUsageStatus,
} from '../interfaces/aiUsage';

// Exactly one of user_id and guest_key is set; enforced by ensureAiUsageEventsSchema.
class AiUsageEvent extends Model<AiUsageEventAttributes, AiUsageEventCreationAttributes> implements AiUsageEventAttributes {
    declare id: number;
    declare action_id: string | null;
    declare operation_id: string;
    declare user_id: number | null;
    declare guest_key: string | null;
    declare operation: AiUsageOperation;
    declare model_tier: ModelTier;
    declare model_id: string;
    declare input_tokens: number;
    declare output_tokens: number;
    declare equiv_tokens: string;
    declare cost_usd: string;
    declare status: AiUsageStatus;
    declare error_code: string | null;
    declare created_at: Date;
    declare finalized_at: Date | null;
}

AiUsageEvent.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    action_id: {
        type: DataTypes.STRING(64),
        allowNull: true,
    },
    operation_id: {
        type: DataTypes.STRING(64),
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    guest_key: {
        type: DataTypes.STRING(64),
        allowNull: true,
    },
    operation: {
        type: DataTypes.STRING(32),
        allowNull: false,
        validate: {
            isIn: { args: [[...AI_USAGE_OPERATIONS]], msg: 'Unknown operation' },
        },
    },
    model_tier: {
        type: DataTypes.STRING(16),
        allowNull: false,
        validate: {
            isIn: { args: [[...MODEL_TIERS]], msg: 'Unknown model_tier' },
        },
    },
    model_id: {
        type: DataTypes.STRING(64),
        allowNull: false,
    },
    input_tokens: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 },
    },
    output_tokens: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 },
    },
    equiv_tokens: {
        type: DataTypes.DECIMAL(20, 4),
        allowNull: false,
        defaultValue: 0,
    },
    cost_usd: {
        type: DataTypes.DECIMAL(12, 6),
        allowNull: false,
        defaultValue: 0,
    },
    status: {
        type: DataTypes.STRING(16),
        allowNull: false,
        validate: {
            isIn: { args: [[...AI_USAGE_STATUSES]], msg: 'Unknown status' },
        },
    },
    error_code: {
        type: DataTypes.STRING(64),
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    finalized_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize,
    tableName: 'ai_usage_events',
    timestamps: false,
    indexes: [...AI_USAGE_EVENTS_INDEXES],
});

export default AiUsageEvent;
