import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/DB/database_config';
import { encrypt, decrypt } from '../utils/encryption';
import {
    ServerCVAttributes, 
    CVContentAttributes, 
    CVTemplates,
    CVCreationAttributes,
    CVLanguage,
    Section
} from '../interfaces/cv';
import { generateUUID } from '../utils/uuid';
import { MediaFilesServices } from '@/services/mediaFiles';
import { OwnerType } from '@/interfaces/mediaFiles';
import { getCVLanguageDetectionText } from '@/utils/cv';
import languageCodeMapper from '@/utils/languageCodeMapper';

type FrancResult = [string, number];
type FrancAllFn = (value: string, options?: { only?: string[] }) => FrancResult[];

let francAllFn: FrancAllFn | null = null;

const getFrancAll = async (): Promise<FrancAllFn> => {
    if (!francAllFn) {
        const francModule = await import('franc');
        francAllFn = francModule.francAll as FrancAllFn;
    }

    return francAllFn;
};

class CV extends Model<ServerCVAttributes, CVCreationAttributes> implements ServerCVAttributes {
    public id!: number;
    public public_id!: string;
    public user_id!: number;
    public title!: string;
    public photo_last_uploaded!: Date | null;
    public jobTitle!: string;
    public template!: CVTemplates;
    public templateColor!: string;
    public content!: CVContentAttributes;
    public sectionsOrder!: Section[];
    public encryptedContent!: string;
    public jobDescription!: string;
    public companyName!: string;
    public language!: CVLanguage | null;
    public detectedLanguage!: CVLanguage | null;
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
        defaultValue: ''
    },
    template: {
        type: DataTypes.ENUM(...Object.values(CVTemplates)),
        allowNull: false,
    },
    templateColor: {
        type: DataTypes.STRING(7),
        allowNull: false,
        defaultValue: '#424242',
    },
    sectionsOrder: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
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
    jobDescription: {
        type: DataTypes.TEXT('medium'),
        allowNull: false,
    },
    companyName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: ''
    },
    language: {
        type: DataTypes.ENUM('en', 'fr', 'es', 'de', 'it', 'pt', 'ro', 'el', 'ru'),
        allowNull: false,
        defaultValue: 'en',
    },
    detectedLanguage: {
        type: DataTypes.ENUM('en', 'fr', 'es', 'de', 'it', 'pt', 'ro', 'el', 'ru'),
        allowNull: true,
        defaultValue: null,
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
            const content = cv.getContent();    
            if (content) {
                cv.setContent(content);
            }
        }, 
        beforeUpdate: async (cv: CV) => {
            const contentChanged = cv.changed('encryptedContent');
            const content = cv.getContent();
            if (content) {
                cv.setContent(content);
            }

            if (cv.changed('detectedLanguage')) return;
            if (!content || !contentChanged) return;

            const languageDetectionText = getCVLanguageDetectionText(content);

            if (languageDetectionText && languageDetectionText.trim().length > 0 && !(languageDetectionText.trim().length < 50)) {
                const francAll = await getFrancAll();
                const result = francAll(languageDetectionText, { only: ['eng', 'fra', 'spa', 'deu', 'ita', 'por', 'ron', 'ell', 'rus'] });
                if (result && result.length > 0) {
                    const detectedLanguage = result[0][0];
                    const confidence = result[0][1];
                    const secondConfidence = result[1]?.[1];

                    const gap = confidence - (secondConfidence || 0);

                    if (detectedLanguage && detectedLanguage !== 'und' && confidence > 0.9 && gap > 0.02) {
                        const mappedLanguage = languageCodeMapper(detectedLanguage) as CVLanguage | null;
                        if (mappedLanguage && !(cv.getDataValue('detectedLanguage') === mappedLanguage)) {
                            cv.setDataValue('detectedLanguage', mappedLanguage);
                        }
                    } else {
                        cv.setDataValue('detectedLanguage', null);
                    }
                }
            } else {
                cv.setDataValue('detectedLanguage', null);
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