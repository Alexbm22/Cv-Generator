import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/DB/database_config';
import { encrypt, decrypt } from '../utils/encryption';
import {
    ServerCVAttributes, 
    CVContentAttributes, 
    CVTemplates,
    CVCreationAttributes
} from '../interfaces/cv';
import { generateUUID } from '../utils/uuid';
import { MediaFilesServices } from '@/services/mediaFiles';
import { OwnerType } from '@/interfaces/mediaFiles';

class CV extends Model<ServerCVAttributes, CVCreationAttributes> implements ServerCVAttributes {
    public id!: number;
    public public_id!: string;
    public user_id!: number;
    public title!: string;
    public photo_last_uploaded!: Date | null;
    public jobTitle!: string;
    public template!: CVTemplates;
    public content!: CVContentAttributes;
    public encryptedContent!: string;
    public createdAt!: Date;
    public updatedAt!: Date;

    public setContent(data: CVContentAttributes) {
        this.setDataValue('encryptedContent',  encrypt(JSON.stringify(data)));
    }

    public getContent() {
        const encryptedContent = this.getDataValue('encryptedContent')
        if (encryptedContent) {
          return JSON.parse(decrypt(encryptedContent));
        }
        return null;
    }
}

CV.init({
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
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    photo_last_uploaded: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: 'Untitled'
    },
    jobTitle: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: 'Untitled'
    },
    template: {
        type: DataTypes.ENUM(...Object.values(CVTemplates)),
        allowNull: false,
    },
    content: {
        type: DataTypes.VIRTUAL,
        get() {
            return this.getContent()
        },
        set(value: CVContentAttributes) {
            if (value) {
                this.setDataValue('encryptedContent', encrypt(JSON.stringify(value)));
            }
        },
    },
    encryptedContent: {
        type: DataTypes.TEXT('long'),
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
    },
    updatedAt: {
        type: DataTypes.DATE,
    }
}, {
    sequelize,
    tableName: 'cvs',
    timestamps: true,
    underscored: true,
    hooks: {
        beforeCreate: (cv: CV) => {
            const content = cv.getDataValue('content')
            if (content) {
                cv.setContent(content);
            }
        }, 
        beforeUpdate: (cv: CV) => {
            const content = cv.getDataValue('content')
            if (content) {
                cv.setContent(content);
            }
        },
        afterFind: (cv: CV | CV[] | null) => {
            if(!cv) return;
            if (Array.isArray(cv)) {
                cv.forEach((instance) => {
                    if(instance.encryptedContent){
                        instance.content = instance.getContent();
                    }
                });
            }
            else{
                if (cv.encryptedContent) {
                    cv.content = cv.getContent();
                }               
            }
        },
        beforeDestroy: async (cv: CV) => {
            await MediaFilesServices.deleteOwnerMediaFiles(cv.get().id, OwnerType.CV);
        }
        
    }
})


export default CV;