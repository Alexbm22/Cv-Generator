import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/DB/database_config';
import {
    AI_USAGE_OPERATIONS,
    AiUsageDailyAttributes,
    AiUsageDailyCreationAttributes,
    AiUsageOperation,
} from '../interfaces/aiUsage';

class AiUsageDaily extends Model<AiUsageDailyAttributes, AiUsageDailyCreationAttributes> implements AiUsageDailyAttributes {
    declare subject_key: string;
    declare usage_date: string;
    declare operation: AiUsageOperation;
    declare equiv_tokens: string;
    declare ops_count: number;
}

AiUsageDaily.init({
    subject_key: {
        type: DataTypes.STRING(128),
        allowNull: false,
        primaryKey: true,
        validate: {
            is: { args: /^(user:\d+|guest:.+)$/, msg: 'Invalid subject_key' },
        },
    },
    usage_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        primaryKey: true,
    },
    operation: {
        type: DataTypes.STRING(32),
        allowNull: false,
        primaryKey: true,
        validate: {
            isIn: { args: [[...AI_USAGE_OPERATIONS]], msg: 'Unknown operation' },
        },
    },
    equiv_tokens: {
        type: DataTypes.DECIMAL(20, 4),
        allowNull: false,
        defaultValue: 0,
    },
    ops_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 },
    },
}, {
    sequelize,
    tableName: 'ai_usage_daily',
    timestamps: false,
});

export default AiUsageDaily;
