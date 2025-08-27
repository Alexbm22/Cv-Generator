import { create } from 'zustand';
import { persist, devtools, createJSONStorage } from 'zustand/middleware';
import { 
    CVStore,
} from '../interfaces/cv';
import { storage  } from '../lib/indexedDB/cvStore';
import { triggerOnChange } from './middleware/triggerOnChange';

export const useCVsStore = create<CVStore>()(
    devtools(
        persist( 
            triggerOnChange<CVStore>({ // to review this part of the code
                callback: () => console.log(''), // to be deleted
                ignoredKeys: ['_hasHydrated', 'lastSynced', 'lastFetched'],
            }) (
                (set) => ({
                    CVs: [],
                    selectedCV: null,

                    setSelectedCV: (CV) => set({selectedCV: CV}),
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