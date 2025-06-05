import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database_config';
import { encrypt, decrypt } from '../utils/encryption';
import {
    CVAttributes, 
    CVContentAttributes, 
    PersonalDataAttributes,
    CVTemplates
}
from '../interfaces/cv_interface';

interface CVCreationAttributes extends Optional<CVAttributes, 'id' | 'encryptedPersonalData' | 'createdAt' | 'updatedAt'> {}

class CV extends Model<CVAttributes, CVCreationAttributes> implements CVAttributes {
    public id!: number;
    public public_id!: string;
    public userId!: number;
    public title!: string;
    public template!: CVTemplates;
    public content!: CVContentAttributes;
    public encryptedPersonalData!: string;
    public personalData?: PersonalDataAttributes | null;
    public createdAt!: Date;
    public updatedAt!: Date;

    public setPersonalData(data: PersonalDataAttributes):void {
        this.personalData = data;
        this.encryptedPersonalData = encrypt(JSON.stringify(data));
    }

    public getPersonalData(): PersonalDataAttributes | null {
        if (this.encryptedPersonalData) {
          return JSON.parse(decrypt(this.encryptedPersonalData));
        }
        return null;
    }
}

CV.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    public_id: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: 'user',
            key: 'id'
        }
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    template: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    content: {
        type: DataTypes.JSON,
        allowNull: false
    },
    encryptedPersonalData: {
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
    tableName: 'cv',
    hooks: {
        beforeCreate: (cv: CV) => {
            if (cv.personalData) {
                cv.setPersonalData(cv.personalData);
            }
        }, 
        beforeUpdate: (cv: CV) => {
            if (cv.personalData) {
                cv.setPersonalData(cv.personalData);
            }
        },
        afterFind: (cv: CV | CV[] | null) => {
            if(!cv) return;
            if (Array.isArray(cv)) {
                cv.forEach((instance) => {
                    if(instance.encryptedPersonalData){
                        instance.personalData = instance.getPersonalData();
                    }
                });
            }
            else{
                if (cv.encryptedPersonalData) {
                    cv.personalData = cv.getPersonalData();
                }
            }
        }
    }
})

export default CV;