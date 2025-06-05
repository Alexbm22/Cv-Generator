import { create, StoreApi } from 'zustand';
import { 
    CVStore,
} from '../interfaces/cv_interface';
import  {
    createMetadataSlice,
    createContentSlice,
    createPersonalInfoSlice,
    createStoreActionsSlice,
} from './slices';
import { withFunctionCallExcept } from './middleware/withFunctionCallExcept';
import { devtools } from 'zustand/middleware';
import { storeConfig } from './config/storeConfig';

export const useCvStore = create<CVStore>()(
    devtools(    
        withFunctionCallExcept<CVStore>(
            storeConfig.middlewareOptions.debouncedCVAutoSave.autoSaveCV, 
            storeConfig.middlewareOptions.debouncedCVAutoSave.excludedActions
        )(
            (set, get): CVStore => ({
                ...createMetadataSlice(set),
                ...createContentSlice(set),
                ...createPersonalInfoSlice(set),
                ...createStoreActionsSlice(set, get)
            })
        ), {
            name: 'CVStore', // Name of the slice in the Redux DevTools
            enabled: import.meta.env.VITE_NODE_ENV === 'development',
            serialize: (state: StoreApi<CVStore>) => JSON.stringify(state), // Serialize the state for better readability in DevTools
        }
    )
)