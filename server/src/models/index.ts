import sequelize from '../config/database_config';
import user from './user';
import CV from './CV';

export {
    user,
    CV
}

export const initModels = async () => {
    //Define Models Relationships here

    switch (process.env.NODE_ENV) {
        case 'development':
            await sequelize.sync({ alter: true });
            break;
        case 'test':
            await sequelize.sync({ force: true });
            break;
        case 'production':
            await sequelize.sync({force: false, alter: false});
            break;
        default:
            await sequelize.sync();
    }
}