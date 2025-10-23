import { DownloadAttributes, DownloadCreationAttributes, DownloadMetadataCVAttributes, PublicDownloadData } from "../interfaces/downloads";
import { decrypt, encrypt } from "../utils/encryption";
import { DataTypes, Model } from "sequelize";
import sequelize from '../config/DB/database_config';
import { generateUUID } from "../utils/uuid";

// to do add preview image
class Download extends Model<DownloadAttributes, DownloadCreationAttributes> implements DownloadAttributes {
    public id!: number;
    public public_id!: string;
    public origin_id!: string;
    public user_id!: number;
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
        }
    }
})

export default Download;