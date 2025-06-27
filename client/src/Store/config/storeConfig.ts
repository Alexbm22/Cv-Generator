import { debounce } from 'lodash';
import { StoreApi } from 'zustand';
import { CVEditStore, CVTemplates } from '../../interfaces/cv_interface';

export const storeConfig = {
    defaultStates: {
        CVObject: {
            id: '',
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
            updatedAt: null
        }
    },
    middlewareOptions: {
        debouncedCVAutoSave : {
            // to do: type config
            autoSaveCV: debounce((api: StoreApi<CVEditStore>)=> {
                const { saveCV } = api.getState();

                saveCV(); // saving the CV to the main user cv list

            }, 1000), // 3 seconds debounce
            excludedActions: ['getCVObject', 'saveCV'], // Actions that should not trigger the auto-save
        }
    }
}