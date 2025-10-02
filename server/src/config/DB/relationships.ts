import { OwnerTypes } from '../../interfaces/mediaFiles';
import * as Models from '../../models'

export const defineTablesRelationships = () => {
    Models.User.hasMany(Models.CV, {
        foreignKey: 'user_id',
        as: 'cvs',
    });

    Models.CV.belongsTo(Models.User, {
        foreignKey: 'user_id',
        as: 'user',
        onUpdate: 'CASCADE'
    });

    Models.User.hasMany(Models.Subscription, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
        as: 'subscriptions',
    });

    Models.Subscription.belongsTo(Models.User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });

    Models.User.hasOne(Models.DownloadCredits, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
        as: 'download_credits',
    });

    Models.DownloadCredits.belongsTo(Models.User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });

    Models.User.hasMany(Models.Payment, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
        as: 'payments',
    });
    
    Models.Payment.belongsTo(Models.User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });

    Models.User.hasMany(Models.Download, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
        as: 'downloads',
    });

    Models.Download.belongsTo(Models.User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });


    Models.CV.hasMany(
        Models.MediaFiles,
        {
            foreignKey: 'owner_id',
            constraints: true,
            scope: { owner_type: OwnerTypes.CV },
            onDelete: 'CASCADE',
            as: 'mediaFiles',
        }
    )

    Models.MediaFiles.belongsTo(
        Models.CV, 
        { 
            foreignKey: 'owner_id',
            constraints: true, 
            scope: { owner_type: OwnerTypes.CV },
            as: 'cv' 
        }
    );

    Models.Download.hasMany(
        Models.MediaFiles,
        {
            foreignKey: 'owner_id',
            constraints: true,
            scope: { owner_type: OwnerTypes.DOWNLOAD },
            onDelete: 'CASCADE',
            as: 'mediaFiles'
        }
    )

    Models.MediaFiles.belongsTo(
        Models.Download, 
        { 
            foreignKey: 'owner_id',
            constraints: true, 
            scope: { owner_type: OwnerTypes.DOWNLOAD },
            as: 'download' 
        }
    );


}