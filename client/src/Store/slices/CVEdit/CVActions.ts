import { 
    CVAttributes,
    CVEditStore,
    CVEditStoreActions,
 } from '../../../interfaces/cv';
import { useCVsStore } from '../../useCVsStore';

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
    saveCV: () => {
        const CV: CVAttributes = get().getCVObject(); 

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