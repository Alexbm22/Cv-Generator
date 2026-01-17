import { DataTypes, Model, Optional } from "sequelize";
import sequelize from '../config/DB/database_config';
import { MimeType, MediaFilesAttributes, MediaFilesCreationAttributes, MediaType, OwnerType } from "../interfaces/mediaFiles";
import { generateUUID } from "../utils/uuid";
import { MediaFilesServices } from "@/services/mediaFiles";

class MediaFiles extends Model<MediaFilesAttributes, MediaFilesCreationAttributes> implements MediaFilesAttributes {
    public id!: number;
    public public_id!: string;
    public user_id!: number;
    public owner_id!: number;
    public owner_type!: OwnerType;
    public filename!: string;
    public mime_type!: MimeType;
    public s3_key!: string;
    public type!: MediaType;
    public size!: number;
    public is_active!: boolean;
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
        type: DataTypes.ENUM(...Object.values(OwnerType)),
        allowNull: false,
    },
    filename: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    mime_type: {
        type: DataTypes.ENUM(...Object.values(MimeType)),
        allowNull: false,
    },
    s3_key: {
        type: DataTypes.STRING(255),
        unique: true,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM(...Object.values(MediaType)),
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    size: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
    timestamps: true,
    hooks: {
        beforeDestroy: async (mediaFile: MediaFiles) => {
            const mediaFileData = mediaFile.get();
            // Delete the file from S3 when the record is deleted
            await MediaFilesServices.deleteFileFromS3(
                mediaFileData.s3_key,
            );
        }
    }
})

export default MediaFiles;