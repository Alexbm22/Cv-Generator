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

interface CVCreationAttributes extends Optional<CVAttributes, 'id' | 'encryptedPersonalData' | 'createdAt' | 'updatedAt' | 'version'> {}

class CV extends Model<CVAttributes, CVCreationAttributes> implements CVAttributes {
    public id!: number;
    public version!: number;
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
        this.setDataValue('encryptedPersonalData',  encrypt(JSON.stringify(data)));
    }

    public setVersion(version: number){
        this.setDataValue('version', version);
    }

    public getPersonalData(): PersonalDataAttributes | null {
        const encryptedPersonalData = this.getDataValue('encryptedPersonalData')
        if (encryptedPersonalData) {
          return JSON.parse(decrypt(encryptedPersonalData));
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
    version : {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
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
    personalData: {
        type: DataTypes.VIRTUAL,
        get() {
            return this.getPersonalData()
        },
        set(value: PersonalDataAttributes) {
            if (value) {
                this.setDataValue('encryptedPersonalData', encrypt(JSON.stringify(value)));
            }
        }
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
            const personalData = cv.getDataValue('personalData')
            if (personalData) {
                cv.setPersonalData(personalData);
            }
        }, 
        beforeUpdate: (cv: CV) => {
            const personalData = cv.getDataValue('personalData')
            if (personalData) {
                cv.setPersonalData(personalData);
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