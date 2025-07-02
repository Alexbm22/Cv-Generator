import { debounce } from 'lodash';
import { StoreApi } from 'zustand'; 
import { v4 as uuid } from 'uuid';
import { CVEditStore, CVTemplates } from '../../interfaces/cv_interface';

export const storeConfig = {
    defaultStates: {
        CVObject: () => ({
            id: uuid(),
            title: '',
            template: CVTemplates.CASTOR,
            professionalSummary: '',
            sectionsOrder: [],
            languages: [],
            skills: [],
            workExperience: [],
            education: [],
            projects: [],
            customSections: {
                title: '',
                content: []
            },
            photo: null,
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            address: '',
            birthDate: new Date(),
            socialLinks: [],
            updatedAt: null,
            version: 0,
        })
    },
    middlewareOptions: {
        debouncedCVAutoSave : {
            // to do: type config
            autoSaveCV: debounce((api: StoreApi<CVEditStore>)=> {
                const { saveCV, setUpdatedAt } = api.getState();

                saveCV(); // saving the CV to the main user cv list
                setUpdatedAt(new Date().getTime());
            }, 1000), // 3 seconds debounce
            excludedActions: ['getCVObject', 'saveCV', 'setUpdatedAt'], // Actions that should not trigger the auto-save
        }
    }
}