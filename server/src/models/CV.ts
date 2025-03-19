import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database_config';
import { encrypt, decrypt } from '../utils/encryption';

export enum ProficiencyLanguageLevel {
    BEGINNER = 'BEGINNER',
    INTERMEDIATE = 'INTERMEDIATE',
    ADVANCED = 'ADVANCED',
    FLUENT = 'FLUENT',
    NATIVE = 'NATIVE'
  }
  
  export enum SkillLevel {
    BEGINNER = 'BEGINNER',
    INTERMEDIATE = 'INTERMEDIATE',
    ADVANCED = 'ADVANCED',
    EXPERT = 'EXPERT'
  }

// to do - adjust the attributes optional fields
interface CVContentAttributes {
    languages?: {
        name: string,
        level: ProficiencyLanguageLevel
    }[],
    skills?: {
        name: string,
        level: SkillLevel
    }[],
    workExperience?: {
        JobTitle: string,
        company: string,
        startDate: Date,
        endDate: Date,
        description: string
    }[],
    education?: {
        degree: string,
        school: string,
        startDate: Date,
        endDate: Date,
        description: string
    }[],
    projects?: {
        name: string;
        description?: string;
        url?: string;
        technologies?: string[];
    }[],
    customSection?: {
        title: string,
        content: {
            title: string,
            description: string
        }[]
    }
}

interface PersonalDataAttributes {
    firstName?: string,
    lastName?: string,
    email?: string,
    phoneNumber?: string,
    address?: string,
    birthDate?: Date,
    socialLinks?: {
        platform: string,
        url: string
    }[]
}

interface CVAttributes {
    id: number,
    title: string,
    userId: number,
    template: string,
    personalData?: PersonalDataAttributes | null,
    encryptedPersonalData: string
    content: CVContentAttributes
    createdAt: Date,
    updatedAt: Date
}

interface CVCreationAttributes extends Optional<CVAttributes, 'id' | 'encryptedPersonalData' | 'createdAt' | 'updatedAt'> {}

class CV extends Model<CVAttributes, CVCreationAttributes> implements CVAttributes {
    public id!: number;
    public userId!: number;
    public title!: string;
    public template!: string;
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