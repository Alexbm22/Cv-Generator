import sequelize from '../config/DB/database_config';
import User from './User';
import CV from './CV';
import Subscriptions from './Subscriptions';
import DownloadCredits from './Download_credits';
import { defineTablesRelationships } from '../config/DB/relationships';
import { Payments } from './Payments';
import { config } from '../config/env';

export {
    User,
    CV,
    Subscriptions,
    DownloadCredits,
    Payments
}

export const initModels = async () => {
    defineTablesRelationships();

    switch (config.NODE_ENV) {
        case 'development':
            await sequelize.sync({ alter: false, force: true });
            break;
        case 'test':
            await sequelize.sync({ force: true });
            break;
        case 'production':
            await sequelize.sync({ force: false, alter: false });
            break;
        default:
            await sequelize.sync();
    }
}