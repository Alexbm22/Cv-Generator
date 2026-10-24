import { DataTypes, QueryInterface } from 'sequelize';
import { CheckSpec, ensureCheck } from './aiUsageSchema';

export const AI_MODEL_PRICES_TABLE = 'ai_model_prices';

const TEMPERATURE_COLUMN = 'temperature';
const TEMPERATURE_CHECK: CheckSpec = {
    name: 'ai_model_prices_temperature_range',
    expression: 'temperature >= 0 AND temperature <= 2',
};

export const ensureAiModelPricesSchema = async (qi: QueryInterface): Promise<void> => {
    if (!(TEMPERATURE_COLUMN in (await qi.describeTable(AI_MODEL_PRICES_TABLE)))) {
        // Existing rows get a placeholder 0; the seed sets the real temperatures.
        await qi.addColumn(AI_MODEL_PRICES_TABLE, TEMPERATURE_COLUMN, {
            type: DataTypes.DECIMAL(3, 2),
            allowNull: false,
            defaultValue: 0,
        });
    }
    await ensureCheck(qi, AI_MODEL_PRICES_TABLE, TEMPERATURE_CHECK);
};
