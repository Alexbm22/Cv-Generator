import { DownloadAttributes, PublicDownloadData } from "../interfaces/downloads";
import { decrypt, encrypt } from "../utils/encryption";
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from '../config/DB/database_config';
import { PublicCVAttributes } from "../interfaces/cv";
import { generateUUID } from "../utils/uuid";

interface DownloadCreationAttributes extends Optional<DownloadAttributes, 
    'id' | 'encryptedMetadata' | 'createdAt' | 'updatedAt' | 'public_id'
> {}

// to do add preview image
class Download extends Model<DownloadAttributes, DownloadCreationAttributes> implements DownloadAttributes {
    public id!: number;
    public public_id!: string;
    public user_id!: number;
    public metadata!: PublicCVAttributes;
    public encryptedMetadata!: string;
    public fileName!: string;
    public fileKey!: string;
    public createdAt!: Date;
    public updatedAt!: Date;

    public setMetadata(value: PublicCVAttributes) {
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

    public toSafeDownload(): PublicDownloadData {
        const {
            public_id: download_id,
            fileName,
            createdAt
        } = this.get();

        return {
            download_id,
            fileName,
            createdAt
        }
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
        type: DataTypes.CHAR(36),
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    metadata: {
        type: DataTypes.VIRTUAL,
        get() {
            return this.getMetadata();
        },
        set(value: PublicCVAttributes) {
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
    fileKey: {
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
    hooks: {
        beforeCreate: (download: Download) => {
            const metadata = download.getDataValue('metadata');
            if(metadata) {
                download.setMetadata(metadata);
            }

            download.setDataValue('public_id', generateUUID());
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
        }
    }
})

export default Download;