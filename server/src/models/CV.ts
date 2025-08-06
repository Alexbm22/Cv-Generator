import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/DB/database_config';
import { encrypt, decrypt } from '../utils/encryption';
import {
    CVAttributes, 
    CVContentAttributes, 
    CVTemplates
} from '../interfaces/cv';
import { generateUUID } from '@/utils/uuid';

interface CVCreationAttributes extends Optional<CVAttributes, 
    'id' | 'encryptedContent' | 'createdAt' | 'updatedAt' | 'version' | 'public_id'
> {}

class CV extends Model<CVAttributes, CVCreationAttributes> implements CVAttributes {
    public id!: number;
    public public_id!: string;
    public user_id!: number;
    public version!: number;
    public title!: string;
    public template!: CVTemplates;
    public content!: CVContentAttributes;
    public encryptedContent!: string;
    public createdAt!: Date;
    public updatedAt!: Date;

    public setContent(data: CVContentAttributes) {
        this.setDataValue('encryptedContent',  encrypt(JSON.stringify(data)));
    }

    public setVersion(version: number) {
        this.setDataValue('version', version);
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
    version : {
        type: DataTypes.INTEGER.UNSIGNED,
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
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    template: {
        type: DataTypes.ENUM(...Object.values(CVTemplates)),
        allowNull: false
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
        }
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

            cv.setDataValue('public_id', generateUUID());
        }, 
        beforeUpdate: (cv: CV) => {
            const content = cv.getDataValue('content')
            if (content) {
                cv.setContent(content);
            }

            const version = cv.getDataValue('version');
            if(version) {
                cv.setVersion(version + 1);
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
        }
    }
})

export default CV;