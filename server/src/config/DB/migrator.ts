import { Umzug, SequelizeStorage } from 'umzug';
import sequelize from './database_config';
import * as createAiModelPrices from './migrations/001-create-ai-model-prices';
import * as createAiPlanPolicy from './migrations/002-create-ai-plan-policy';

export const migrator = new Umzug({
    migrations: [
        { name: '001-create-ai-model-prices', up: createAiModelPrices.up, down: createAiModelPrices.down },
        { name: '002-create-ai-plan-policy', up: createAiPlanPolicy.up, down: createAiPlanPolicy.down },
    ],
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize, tableName: 'schema_migrations' }),
    logger: console,
});
