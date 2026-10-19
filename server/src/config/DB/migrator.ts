import { Umzug, SequelizeStorage } from 'umzug';
import sequelize from './database_config';
import * as createAiModelPrices from './migrations/001-create-ai-model-prices';
import * as createAiPlanPolicy from './migrations/002-create-ai-plan-policy';
import * as createAiUsageEvents from './migrations/003-create-ai-usage-events';
import * as createAiUsageDaily from './migrations/004-create-ai-usage-daily';
import * as alignAiFeatures from './migrations/005-align-ai-features';

export const migrator = new Umzug({
    migrations: [
        { name: '001-create-ai-model-prices', up: createAiModelPrices.up, down: createAiModelPrices.down },
        { name: '002-create-ai-plan-policy', up: createAiPlanPolicy.up, down: createAiPlanPolicy.down },
        { name: '003-create-ai-usage-events', up: createAiUsageEvents.up, down: createAiUsageEvents.down },
        { name: '004-create-ai-usage-daily', up: createAiUsageDaily.up, down: createAiUsageDaily.down },
        { name: '005-align-ai-features', up: alignAiFeatures.up, down: alignAiFeatures.down },
    ],
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize, tableName: 'schema_migrations' }),
    logger: console,
});
