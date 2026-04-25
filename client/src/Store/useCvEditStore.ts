import { create } from 'zustand';
import { 
    CVEditStore,
    EditorType,
} from '../interfaces/cv';
import  {
    createMetadataSlice,
    createContentSlice,
    createPersonalInfoSlice,
    createStoreActionsSlice,
} from './slices/CVEdit';

import { devtools } from 'zustand/middleware';
import { triggerOnAction } from './middleware';
import { autoSaveCV } from '../services/CVLocal';

export const useCvEditStore = create<CVEditStore>()(
    devtools(    
        triggerOnAction<CVEditStore>({
            callback: autoSaveCV(),
            excludedActions: [
                'getGuestCVObject', 
                'setGuestCV', 
                'setUserCV', 
                'getUserCVObject',
                'setEditorType',
            ]
        })(
            (set, get): CVEditStore => ({
                ...createMetadataSlice(set),
                ...createContentSlice(set),
                ...createPersonalInfoSlice(set),
                ...createStoreActionsSlice(set, get),
                editorType: 'form' as EditorType,
                setEditorType: (type: EditorType) => set({ editorType: type }),
                colorTheme: null,
                setTemplateColorTheme: (color: string) => set({ colorTheme: color }),
            })
        ), 
        {
            name: 'CVStore', // Name of the slice in the Redux DevTools
            enabled: import.meta.env.VITE_NODE_ENV === 'development',
        }
    )
)