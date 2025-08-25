import { create } from 'zustand';
import { persist, devtools, createJSONStorage } from 'zustand/middleware';
import { 
    CVStore,
} from '../interfaces/cv';
import { storage  } from '../lib/indexedDB/cvStore';
import { triggerOnChange } from './middleware/triggerOnChange';
import { CVLocalService } from '../services/CVLocal';

export const useCVsStore = create<CVStore>()(
    devtools(
        persist( 
            triggerOnChange<CVStore>({ // to review this part of the code
                callback: CVLocalService.handleCVsHydration.bind(CVLocalService),
                ignoredKeys: ['_hasHydrated', 'lastSynced', 'lastFetched'],
            }) (
                (set) => ({
                    CVs: [],

                    clearCVsData: () => {
                        set({ CVs: [] })
                    },
                    
                    setCVs: (CVs) => set({ CVs }),

                    addCV: (CV) => {
                        set((state) => ({ CVs: state.CVs.concat(CV) }));
                    },

                    removeCV: (id: string) => {
                        set((state) => ({ CVs: state.CVs.filter((cv) => cv.id !== id) }))
                    },
                })
            ), 
        {
            name: 'Resumes',
            storage: createJSONStorage(() => storage), // sau sessionStorage
            partialize: (state) => ({
                CVs: state.CVs
            }),
        }), {
            name: 'CVsStore', // Name of the slice in the Redux DevTools
            enabled: import.meta.env.VITE_NODE_ENV === 'development',
        }
    )
)