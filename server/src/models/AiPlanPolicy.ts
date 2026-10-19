import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/DB/database_config';
import { FEATURES, MODEL_TIERS, PLAN_IDS } from '../ai/models.catalog';

class AiPlanPolicy extends Model {
    declare plan_id: string;
    declare feature: string;
    declare model_tier: string;
    declare max_input_tokens: number;
    declare max_output_tokens: number;
}

AiPlanPolicy.init({
    plan_id: {
        type: DataTypes.STRING(64),
        primaryKey: true,
        allowNull: false,
        validate: {
            isIn: { args: [[...PLAN_IDS]], msg: 'Unknown plan_id' },
        },
    },
    feature: {
        type: DataTypes.STRING(32),
        primaryKey: true,
        allowNull: false,
        validate: {
            isIn: { args: [[...FEATURES]], msg: 'Unknown feature' },
        },
    },
    model_tier: {
        type: DataTypes.STRING(16),
        allowNull: false,
        validate: {
            isIn: { args: [[...MODEL_TIERS]], msg: 'Unknown model_tier' },
        },
    },
    max_input_tokens: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1 },
    },
    max_output_tokens: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1 },
    },
}, {
    sequelize,
    tableName: 'ai_plan_policy',
    timestamps: false,
});

export default AiPlanPolicy;
