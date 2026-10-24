import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/DB/database_config';
import {
    AI_USAGE_OPERATIONS,
    AiUsageDailyAttributes,
    AiUsageDailyCreationAttributes,
    AiUsageOperation,
} from '../interfaces/aiUsage';

class AiUsageDaily extends Model<AiUsageDailyAttributes, AiUsageDailyCreationAttributes> implements AiUsageDailyAttributes {
    declare user_id: number;
    declare usage_date: string;
    declare operation: AiUsageOperation;
    declare credits: string;
    declare ops_count: number;
}

AiUsageDaily.init({
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
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
    credits: {
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
