import sequelize from './database_config';
import { defineTablesRelationships } from './relationships';
import { config } from '../env';

export const initModels = async () => {
    defineTablesRelationships();

    switch (config.NODE_ENV) {
        case 'development':
            await sequelize.sync({});
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
}