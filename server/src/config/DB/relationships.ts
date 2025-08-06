import {
    User,
    CV,
    Subscription,
    DownloadCredits,
    Payment
} from '../../models'
import * as Models from '../../models'

export const defineTablesRelationships = () => {
    Models.User.hasMany(Models.CV, {
        foreignKey: 'user_id',
        as: 'cvs',
    });

    Models.User.hasMany(Models.Subscription, {
        foreignKey: 'user_id',
        as: 'subscriptions',
    });

    Models.User.hasOne(Models.DownloadCredits, {
        foreignKey: 'user_id',
        as: 'download_credits',
    });

    Models.User.hasMany(Models.Payment, {
        foreignKey: 'user_id',
        as: 'payments',
    });

    Models.User.hasMany(Models.Download, {
        foreignKey: 'user_id',
        as: 'downloads',
    });

    Models.Payment.belongsTo(Models.User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });

    Models.Download.belongsTo(Models.User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });

    Models.DownloadCredits.belongsTo(Models.User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });

    Models.Subscription.belongsTo(Models.User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });

    Models.CV.belongsTo(Models.User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });
}