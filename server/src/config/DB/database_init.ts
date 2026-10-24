import sequelize from './database_config';
import { defineTablesRelationships } from './relationships';
import { config } from '../env';
import { ensureAiUsageDailySchema, ensureAiUsageEventsSchema } from './aiUsageSchema';
import { ensureAiModelPricesSchema } from './aiModelPricesSchema';

export const initModels = async () => {
    defineTablesRelationships();

    switch (config.NODE_ENV) {
        case 'development':
            //await sequelize.sync({alter: true , force: true});
            await sequelize.sync();
            break;
        case 'test':
            await sequelize.sync({ force: true });
            break;
        case 'production':
            await sequelize.sync();
            break;
        default:
            await sequelize.sync();
    }

    await ensureAiUsageEventsSchema(sequelize.getQueryInterface());
    await ensureAiUsageDailySchema(sequelize.getQueryInterface());
    await ensureAiModelPricesSchema(sequelize.getQueryInterface());
}

// Drops every table, including ones not registered as models, then recreates the schema.
export const resetDatabase = async () => {
    if (config.NODE_ENV !== 'development') {
        throw new Error('resetDatabase is only allowed when NODE_ENV=development');
    }

    defineTablesRelationships();
    await sequelize.getQueryInterface().dropAllTables();
    await sequelize.sync();

    await ensureAiUsageEventsSchema(sequelize.getQueryInterface());
    await ensureAiUsageDailySchema(sequelize.getQueryInterface());
    await ensureAiModelPricesSchema(sequelize.getQueryInterface());
}