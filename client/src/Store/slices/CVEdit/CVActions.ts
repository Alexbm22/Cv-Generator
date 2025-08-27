import { 
    CVAttributes,
    CVEditStore,
    CVEditStoreActions,
 } from '../../../interfaces/cv';

export const createStoreActionsSlice = (set: {
    (partial: CVEditStore | Partial<CVEditStore> | ((state: CVEditStore) => CVEditStore | Partial<CVEditStore>), replace?: false): void;
    (state: CVEditStore | ((state: CVEditStore) => CVEditStore), replace: true): void;
},get: () => CVEditStore): CVEditStoreActions => ({

    getCVObject: () => { 
        const store = get();
        const CVObj = Object.fromEntries(
            Object.entries(store).filter(([_, value]) => typeof value !== 'function')
        ) as CVAttributes

        return CVObj;
    },
    setCV: (CV: CVAttributes) => {
        set((state) => ({
            ...state,
            ...CV,
        }));
    }
})