import { DataTypes, Model, Optional } from "sequelize";
import sequelize from '../config/DB/database_config';
import { MediaFilesAttributes, MediaFilesCreationAttributes, MediaTypes, OwnerTypes } from "../interfaces/mediaFiles";
import { generateUUID } from "../utils/uuid";

class MediaFiles extends Model<MediaFilesAttributes, MediaFilesCreationAttributes> implements MediaFilesAttributes {
    public id!: number;
    public public_id!: string;
    public owner_id!: number;
    public owner_type!: OwnerTypes;
    public file_name!: string;
    public obj_key!: string;
    public type!: MediaTypes;
    public createdAt!: Date;
    public updatedAt!: Date;
}

MediaFiles.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    public_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        defaultValue: () => generateUUID(),
    },
    owner_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    owner_type: {
        type: DataTypes.ENUM(...Object.values(OwnerTypes)),
        allowNull: false,
    },
    file_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    obj_key: {
        type: DataTypes.STRING(255),
        unique: true,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM(...Object.values(MediaTypes)),
        allowNull: false,
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
    tableName: 'media_files',
    timestamps: true
})

export default MediaFiles;