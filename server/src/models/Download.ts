import { DownloadAttributes, DownloadCreationAttributes, DownloadMetadataCVAttributes, DownloadStatus } from "../interfaces/downloads";
import { decrypt, encrypt } from "../utils/encryption";
import { DataTypes, Model } from "sequelize";
import sequelize from '../config/DB/database_config';
import { generateUUID } from "../utils/uuid";
import { MediaFilesServices } from "@/services/mediaFiles";
import { OwnerType } from "@/interfaces/mediaFiles";

// to do add preview image
class Download extends Model<DownloadAttributes, DownloadCreationAttributes> implements DownloadAttributes {
    public id!: number;
    public public_id!: string;
    public origin_id!: string;
    public user_id!: number;
    public snapshot_id!: number;
    public snapshot_hash!: string;
    public status!: DownloadStatus;
    public action_id!: string;
    public pending_expires_at!: Date | null;
    public completed_at!: Date | null;
    public metadata!: DownloadMetadataCVAttributes;
    public encryptedMetadata!: string;
    public fileName!: string;
    public createdAt!: Date;
    public updatedAt!: Date;

    public setMetadata(value: DownloadMetadataCVAttributes) {
        if (value) {
            this.setDataValue('encryptedMetadata', encrypt(JSON.stringify(value)));
        }
    }

    public getMetadata() {
        const encryptedData = this.getDataValue('encryptedMetadata')
        if (encryptedData) {
            return JSON.parse(decrypt(encryptedData));
        }
        return null;
    }
}

Download.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },    
    public_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        defaultValue: () => generateUUID(),
    },
    origin_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    snapshot_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: 'cv_snapshots',
            key: 'id'
        }
    },
    snapshot_hash: {
        type: DataTypes.CHAR(64),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM(...Object.values(DownloadStatus)),
        allowNull: false,
        defaultValue: DownloadStatus.PENDING,
    },
    action_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    pending_expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    completed_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    metadata: {
        type: DataTypes.VIRTUAL,
        get() {
            return this.getMetadata();
        },
        set(value: DownloadMetadataCVAttributes) {
            return this.setMetadata(value);
        }
    },
    encryptedMetadata: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
    },
    fileName: {
        type: DataTypes.CHAR(64),
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
    },
    updatedAt: {
        type: DataTypes.DATE,
    },
}, {
    sequelize,
    tableName: 'downloads',
    timestamps: true,
    underscored: true,
    indexes: [
        { unique: true, fields: ['user_id', 'origin_id', 'snapshot_hash'] },
        { fields: ['status', 'pending_expires_at'] }
    ],
    hooks: {
        beforeCreate: (download: Download) => {
            const metadata = download.getDataValue('metadata');
            if(metadata) {
                download.setMetadata(metadata);
            }
        },
        beforeUpdate: (download: Download) => {
            const metadata = download.getDataValue('metadata');
            if(metadata) {
                download.setMetadata(metadata);
            }
        },
        afterFind: (download: Download | Download[] | null) => {
            if(!download) return;
            if (Array.isArray(download)) {
                download.forEach((instance) => {
                    if(instance.encryptedMetadata){
                        instance.metadata = instance.getMetadata();
                    }
                });
            }
            else{
                if (download.encryptedMetadata) {
                    download.metadata = download.getMetadata();
                }
            }
        },
        beforeDestroy: async (download: Download) => {
            await MediaFilesServices.deleteOwnerMediaFiles(download.get().id, OwnerType.DOWNLOAD);
        }
    }
})

export default Download;