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

import { devtools } from 'zustand/middleware';
import { CVLocalService } from '../services/CVLocal';
import { triggerOnAction } from './middleware';

export const useCvEditStore = create<CVEditStore>()(
    devtools(    
        triggerOnAction<CVEditStore>({
            callback: CVLocalService.autoSaveCV().bind(CVLocalService),
            excludedActions: ['getCVObject', 'setCV']
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