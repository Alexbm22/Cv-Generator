import { 
    CVAttributes,
    CVEditStore,
    CVEditStoreActions,
    SyncState,
 } from '../../../interfaces/cv_interface';
import { useCVsStore } from '../../useCVsStore';

export const createStoreActionsSlice = (set: {
    (partial: CVEditStore | Partial<CVEditStore> | ((state: CVEditStore) => CVEditStore | Partial<CVEditStore>), replace?: false): void;
    (state: CVEditStore | ((state: CVEditStore) => CVEditStore), replace: true): void;
},get: () => CVEditStore): CVEditStoreActions => ({

    setSyncState: (syncState: SyncState) => {}, 

    getCVObject: () => { 
        const CV = get();
        const CVObject = {
            id: CV.id,
            title: CV.title,
            template: CV.template,
            professionalSummary: CV.professionalSummary,
            sectionsOrder: CV.sectionsOrder,
            languages: CV.languages,
            skills: CV.skills,
            workExperience: CV.workExperience,
            education: CV.education,
            projects: CV.projects,
            customSections: CV.customSections,
            photo: CV.photo,
            firstName: CV.firstName,
            lastName: CV.lastName,
            email: CV.email,
            phoneNumber: CV.phoneNumber,
            address: CV.address,
            birthDate: CV.birthDate,
            socialLinks: CV.socialLinks,
            updatedAt: CV.updatedAt,
        }
        return CVObject;
    },
    saveCV: () => {
        const CV: CVAttributes = get().getCVObject(); 

        console.log(new Date().getTime())
        const { updateCV } = useCVsStore.getState();
        updateCV(CV);
    },
    setCV: (CV: CVAttributes) => {
        set((state) => ({
            ...state,
            ...CV,
        }));
    }
})