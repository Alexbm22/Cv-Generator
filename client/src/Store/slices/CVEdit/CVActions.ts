import { 
    UserCVAttributes,
    CVEditStore,
    CVEditStoreActions,
    CVEditStoreObjectAttributes,
    GuestCVAttributes,
 } from '../../../interfaces/cv';

export const createStoreActionsSlice = (set: {
    (partial: CVEditStore | Partial<CVEditStore> | ((state: CVEditStore) => CVEditStore | Partial<CVEditStore>), replace?: false): void;
    (state: CVEditStore | ((state: CVEditStore) => CVEditStore), replace: true): void;
},get: () => CVEditStore): CVEditStoreActions => ({

    getUserCVObject: () => { 
        const store = get();
        const CVStoreObj = Object.fromEntries(
            Object.entries(store).filter(([key, value]) => 
                (typeof value !== 'function') || 
                (key === 'GuestPreview') || (key === 'GuestPhoto') || 
                (key === 'UserPreview') || (key === 'UserPhoto') 
            )
        ) as Omit<CVEditStoreObjectAttributes, 
            'GuestPreview' | 'GuestPhoto' | 'UserPhoto' | 'UserPreview'
        >

        const UserCVObj = {
            ...CVStoreObj,
            photo: store.UserPhoto,
            preview: store.UserPreview
        };

        return UserCVObj;
    },

    setUserCV: (CV: UserCVAttributes) => {

        const CVObj = Object.fromEntries(
            Object.entries(CV).filter(([key]) => 
                !((key === 'photo') || (key === 'preview')) 
            )
        ) as Omit<UserCVAttributes, 
            'preview' | 'photo'
        >

        const CVStoreObj = {
            ...CVObj,
            UserPhoto: CV.photo,
            UserPreview: CV.preview
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
                (typeof value !== 'function') || 
                (key === 'GuestPreview') || (key === 'GuestPhoto') || 
                (key === 'UserPreview') || (key === 'UserPhoto') 
            )
        ) as Omit<CVEditStoreObjectAttributes, 
            'GuestPreview' | 'GuestPhoto' | 'UserPhoto' | 'UserPreview'
        >

        const UserCVObj = {
            ...CVStoreObj,
            photo: store.GuestPhoto,
            preview: store.GuestPreview
        };

        return UserCVObj;
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