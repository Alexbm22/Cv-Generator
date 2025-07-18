import { create } from 'zustand';
import { 
    CVEditStore,
} from '../interfaces/cv';
import  {
    createMetadataSlice,
    createContentSlice,
    createPersonalInfoSlice,
    createStoreActionsSlice,
} from './slices/CVEdit';
import { triggerOnChange } from './middleware/triggerOnChange';
import { devtools } from 'zustand/middleware';
import { storeConfig } from './config/storeConfig';

export const useCvEditStore = create<CVEditStore>()(
    devtools(    
        triggerOnChange<CVEditStore>({
            callback: storeConfig.middlewareOptions.debouncedCVAutoSave.autoSaveCV, 
            ignoredKeys: ['updatedAt']
        })(
            (set, get): CVEditStore => ({
                ...createMetadataSlice(set),
                ...createContentSlice(set),
                ...createPersonalInfoSlice(set),
                ...createStoreActionsSlice(set, get)
            })
        ), 
        {
            name: 'CVStore', // Name of the slice in the Redux DevTools
            enabled: import.meta.env.VITE_NODE_ENV === 'development',
        }
    )
)