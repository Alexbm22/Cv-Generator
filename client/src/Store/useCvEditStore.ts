import { create, StoreApi } from 'zustand';
import { 
    CVEditStore,
} from '../interfaces/cv';
import  {
    createMetadataSlice,
    createContentSlice,
    createPersonalInfoSlice,
    createStoreActionsSlice,
} from './slices/CVEdit';
import { withFunctionCallExcept } from './middleware/withFunctionCallExcept';
import { devtools } from 'zustand/middleware';
import { storeConfig } from './config/storeConfig';

export const useCvEditStore = create<CVEditStore>()(
    devtools(    
        withFunctionCallExcept<CVEditStore>(
            storeConfig.middlewareOptions.debouncedCVAutoSave.autoSaveCV, 
            storeConfig.middlewareOptions.debouncedCVAutoSave.excludedActions
        )(
            (set, get): CVEditStore => ({
                ...createMetadataSlice(set),
                ...createContentSlice(set),
                ...createPersonalInfoSlice(set),
                ...createStoreActionsSlice(set, get)
            })
        ), {
            name: 'CVStore', // Name of the slice in the Redux DevTools
            enabled: import.meta.env.VITE_NODE_ENV === 'development',
            serialize: (state: StoreApi<CVEditStore>) => JSON.stringify(state), // Serialize the state for better readability in DevTools
        }
    )
)