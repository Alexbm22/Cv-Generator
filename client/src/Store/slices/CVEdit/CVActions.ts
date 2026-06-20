import { 
    UserCVAttributes,
    CVEditStore,
    CVEditStoreActions,
    CVEditStoreObjectAttributes,
    GuestCVAttributes,
 } from '../../../interfaces/cv';
import { JobData } from '../../../services/ai';
import { useCVsStore } from '../../useCVsStore';

export const createStoreActionsSlice = (set: {
    (partial: CVEditStore | Partial<CVEditStore> | ((state: CVEditStore) => CVEditStore | Partial<CVEditStore>), replace?: false): void;
    (state: CVEditStore | ((state: CVEditStore) => CVEditStore), replace: true): void;
},get: () => CVEditStore): CVEditStoreActions => ({

    getUserCVObject: () => { 
        const store = get();
        const CVStoreObj = Object.fromEntries(
            Object.entries(store).filter(([key, value]) => 
                (typeof value !== 'function') &&
                (key !== 'GuestPreview') && (key !== 'GuestPhoto') && 
                (key !== 'UserPreview') && (key !== 'UserPhoto') 
            )
        ) as Omit<CVEditStoreObjectAttributes, 
            'GuestPreview' | 'GuestPhoto' | 'UserPhoto' | 'UserPreview'
        >

        const UserCVObj = {
            ...CVStoreObj,
            photoId: store.UserPhotoId,
            previewId: store.UserPreviewId
        };

        return UserCVObj;
    },

    getJobData: () => {
        const store = get();
        return {
            jobTitle: store.jobTitle,
            companyName: store.companyName,
            jobDescription: store.jobDescription
        } as JobData;
    },

    setUserCV: (CV: UserCVAttributes) => {

        const CVObj = Object.fromEntries(
            Object.entries(CV).filter(([key]) => 
                !((key === 'photoId') || (key === 'previewId')) 
            )
        ) as Omit<UserCVAttributes, 
            'previewId' | 'photoId'
        >

        const CVStoreObj = {
            ...CVObj,
            UserPhotoId: CV.photoId,
            UserPreviewId: CV.previewId
        } as CVEditStoreObjectAttributes


        set((state) => ({
            ...state,
            ...CVStoreObj,
        }));
    }, 

    getGuestCVObject: () => { 
        const store = get();
        const CVStoreObj = Object.fromEntries(
            Object.entries(store).filter(([key, value]) => 
                (typeof value !== 'function') &&
                (key !== 'GuestPreview') && (key !== 'GuestPhoto') &&
                (key !== 'UserPreview') && (key !== 'UserPhoto') 
            )
        ) as Omit<CVEditStoreObjectAttributes, 
            'GuestPreview' | 'GuestPhoto' | 'UserPhoto' | 'UserPreview'
        >

        const GuestCVObj = {
            ...CVStoreObj,
            photo: store.GuestPhoto,
            preview: store.GuestPreview
        };

        return GuestCVObj;
    },

    getGuestCVAIData: () => {
        const store = get();
        const GuestCVAIDataObj = {
            title: store.title,
            template: store.template,
            templateColor: store.templateColor,
            firstName: store.firstName,
            lastName: store.lastName,
            email: store.email,
            phoneNumber: store.phoneNumber,
            address: store.address,
            birthDate: new Date(store.birthDate).toISOString(),
            aboutMe: store.aboutMe,
            languages: store.languages,
            skills: store.skills,
            workExperience: store.workExperience,
            education: store.education,
            projects: store.projects,
            customSections: store.customSections,
            socialLinks: store.socialLinks
        };

        return GuestCVAIDataObj;
    },

    getCVObject: () => {
        const isUser = useCVsStore.getState().CVState.mode === 'user';
        return isUser ? get().getUserCVObject() : get().getGuestCVObject();
    },

    setGuestCV: (CV: GuestCVAttributes) => {
        const CVObj = Object.fromEntries(
            Object.entries(CV).filter(([key]) => 
                !((key === 'photo') || (key === 'preview')) 
            )
        ) as Omit<GuestCVAttributes, 
            'preview' | 'photo'
        >

        const CVStoreObj = {
            ...CVObj,
            GuestPhoto: CV.photo,
            GuestPreview: CV.preview
        } as CVEditStoreObjectAttributes

        set((state) => ({
            ...state,
            ...CVStoreObj,
        }));
    }
})