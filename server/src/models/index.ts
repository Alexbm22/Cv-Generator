import sequelize from '../config/database_config';
import User from './User';
import CV from './CV';

export {
    User,
    CV
}

export const initModels = async () => {
    User.hasMany(CV, {
        foreignKey: 'userId',
        as: 'cvs',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });

    CV.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });

    switch (process.env.NODE_ENV) {
        case 'development':
            await sequelize.sync({ alter: false, force: true });
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