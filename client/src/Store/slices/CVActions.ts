import { useUserStore } from '../useUserStore';
import { 
    CVAttributes,
    CVStore,
    CVStoreActions,
    SyncState,
 } from '../../interfaces/cv_interface';

export const createStoreActionsSlice = (set: {
    (partial: CVStore | Partial<CVStore> | ((state: CVStore) => CVStore | Partial<CVStore>), replace?: false): void;
    (state: CVStore | ((state: CVStore) => CVStore), replace: true): void;
},get: () => CVStore): CVStoreActions => ({

    syncState: SyncState.SYNCED,
    setSyncState: (syncState: SyncState) => set({syncState}), 

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
            socialLinks: CV.socialLinks
        }
        return CVObject;
    },
    saveCV: () => {
        if (!get().id)  get().setId(undefined); // set id if not set
        const CV: CVAttributes = get().getCVObject(); 

        const { updateCV } = useUserStore.getState();
        updateCV(CV);
    },
    setCV: (CV: CVAttributes) => {
        set((state) => ({
            ...state,
            ...CV,
        }));
    }
})