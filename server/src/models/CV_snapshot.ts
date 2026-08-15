import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/DB/database_config';
import { CVLanguage, CVTemplates, Section } from '@/interfaces/cv';
import { generateUUID } from '@/utils/uuid';
import { MediaFilesServices } from '@/services/mediaFiles';
import { OwnerType } from '@/interfaces/mediaFiles';
import { decrypt, encrypt } from '@/utils/encryption';

export interface CVSnapshotAttributes {
    id: number;
    public_id: string;
    user_id: number;
    origin_id: string;
    snapshot_hash: string;
    title: string;
    template: CVTemplates;
    templateColor: string;
    content: string; 
    sectionsOrder: Section[];
    jobTitle: string;
    jobDescription: string;
    companyName: string;
    language: CVLanguage | null;
    detectedLanguage: CVLanguage | null;
    createdAt: Date;
    updatedAt: Date;
}

class CVSnapshot extends Model<CVSnapshotAttributes, Optional<CVSnapshotAttributes, 'id' | 'public_id' | 'createdAt' | 'updatedAt'>> implements CVSnapshotAttributes {
    public id!: number;
    public public_id!: string;
    public user_id!: number;
    public origin_id!: string;
    public snapshot_hash!: string;
    public title!: string;
    public template!: CVTemplates;
    public templateColor!: string;
    public content!: string; // Encrypted content
    public sectionsOrder!: Section[];
    public jobTitle!: string;
    public jobDescription!: string;
    public companyName!: string;
    public language!: CVLanguage | null;
    public detectedLanguage!: CVLanguage | null;
    public createdAt!: Date;
    public updatedAt!: Date;
}

CVSnapshot.init(
    {
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
        user_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            references: {
                model: 'users',
                key: 'id'
            },
            allowNull: false,
        },
        origin_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        snapshot_hash: {
            type: DataTypes.CHAR(64),
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        template: {
            type: DataTypes.ENUM(...Object.values(CVTemplates)),
            allowNull: false,
        },
        templateColor: {
            type: DataTypes.STRING(7),
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
            get() {
                return decrypt(this.getDataValue('content'));
            },
            set(value: string) {
                this.setDataValue('content', encrypt(value));
            },
        },
        sectionsOrder: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        jobTitle: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        jobDescription: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        companyName: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        language: {
            type: DataTypes.ENUM('en', 'fr', 'es', 'de', 'it', 'pt', 'ro', 'el', 'ru'),
            allowNull: true,
        },
        detectedLanguage: {
            type: DataTypes.ENUM('en', 'fr', 'es', 'de', 'it', 'pt', 'ro', 'el', 'ru'),
            allowNull: true,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'cv_snapshots',
        indexes: [
            {
                unique: true,
                fields: ['user_id', 'origin_id', 'snapshot_hash']
            }
        ],
        hooks: {
            beforeDestroy: async (snapshot: CVSnapshot) => {
                await MediaFilesServices.deleteOwnerMediaFiles(snapshot.get().id, OwnerType.CV_SNAPSHOT);
            }
        }
    }
);

export default CVSnapshot;