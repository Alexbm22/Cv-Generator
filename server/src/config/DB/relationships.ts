import {
    User,
    CV,
    Subscriptions,
    DownloadCredits,
    Payments
} from '../../models'

export const defineTablesRelationships = () => {
    User.hasMany(CV, {
        foreignKey: 'user_id',
        as: 'cvs',
    });

    User.hasMany(Subscriptions, {
        foreignKey: 'user_id',
        as: 'subscriptions',
    });

    User.hasOne(DownloadCredits, {
        foreignKey: 'user_id',
        as: 'downloadCredits',
    });

    User.hasMany(Payments, {
        foreignKey: 'user_id',
        as: 'payments',
    });

    Payments.belongsTo(User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });

    DownloadCredits.belongsTo(User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });

    Subscriptions.belongsTo(User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });

    CV.belongsTo(User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });
}