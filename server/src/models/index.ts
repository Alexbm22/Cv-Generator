import sequelize from '../config/DB/database_config';
import { defineTablesRelationships } from '../config/DB/relationships';
import { config } from '../config/env';

export { default as User} from "./User";
export { default as Payment} from "./Payment";
export { default as CV} from './CV';
export { default as Subscription} from './Subscription';
export { default as DownloadCredits} from './Download_credits';
export { default as Download } from './Download';
export { default as MediaFiles } from './Media_files';

export const initModels = async () => {
    defineTablesRelationships();

    switch (config.NODE_ENV) {
        case 'development':
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
}