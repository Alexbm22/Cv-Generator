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
    public id!: number;
    public user_id!: number;
    public credits!: number;
    public createdAt!: Date;
    public updatedAt!: Date;
}

DownloadCredits.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: 'user',
            key: 'id'
        }
    },
    credits: {
        type: DataTypes.INTEGER.UNSIGNED,
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
