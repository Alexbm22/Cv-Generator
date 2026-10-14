import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/DB/database_config';

interface DownloadCreditsAttributes {
    id: number;
    user_id: number;
    credits: number;
    createdAt: Date;
    updatedAt: Date;
}

interface DownloadCreditsCreationAttributes extends Optional<DownloadCreditsAttributes, 
    'id' | 'createdAt' | 'updatedAt' | 'credits'
> {}

class DownloadCredits extends Model<DownloadCreditsAttributes, DownloadCreditsCreationAttributes> implements DownloadCreditsAttributes {
    declare id: number;
    declare user_id: number;
    declare credits: number;
    declare createdAt: Date;
    declare updatedAt: Date;
}

DownloadCredits.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    credits: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    }
}, {
    sequelize,
    tableName: 'download_credits',
    timestamps: true
});

export default DownloadCredits;
