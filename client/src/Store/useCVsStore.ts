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
            triggerOnChange<CVStore>({
                callback: CVLocalService.handleCVHydration.bind(CVLocalService),
                ignoredKeys: ['_hasHydrated', 'lastSynced', 'lastFetched'],
            }) (
                (set, get) => ({
                    CVs: [],

                    _hasHydrated: false,
                    lastSynced: null,
                    lastFetched: null,
                    
                    setLastSynced: () => set({ lastSynced: new Date().getTime() }),
                    isSyncStale: () => {
                        const now = new Date().getTime();
                        const lastSynced = get().lastSynced;
                        const maximumStalePeriod = 0.5 * 60 * 1000; // 1 minutes

                        if(!lastSynced) return true;
                        
                        return (now - lastSynced) > maximumStalePeriod;
                    },

                    setlastFetched: () => set({ lastFetched: new Date().getTime() }),
                    isFetchStale: () => {
                        const now = new Date().getTime();
                        const lastFetched = get().lastFetched;
                        const maximumStalePeriod = 0.5 * 60 * 1000; // 1 minutes

                        if(!lastFetched) return true;
                        
                        return (now - lastFetched) > maximumStalePeriod;
                    },
                    
                    setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),

                    clearCVsData: () => {
                        set({
                            CVs: [],
                            lastSynced: null,
                            _hasHydrated: false
                        })
                    },
                    
                    getChangedCVs: () => {
                        // to be improved
                        const { lastSynced, CVs } = get();
                        
                        return CVs.filter((cv) => 
                            cv.updatedAt && cv.updatedAt > lastSynced!
                        )
                    },

                    setCVs: (CVs) => set({ CVs }),

                    addCV: (CV) => {
                        set((state) => ({ CVs: state.CVs.concat(CV) }));
                    },

                    removeCV: (id: string) => {
                        set((state) => ({ CVs: state.CVs.filter((cv) => cv.id !== id) }))
                    },

                    updateCV: (updatedCV) => {
                        if (get().CVs.some((cv) => cv.id === updatedCV.id)) {
                            set((state) => ({ CVs: state.CVs.map((cv) => (cv.id === updatedCV.id ? updatedCV : cv)) }))
                        } else { 
                            get().addCV(updatedCV);
                        }
                    },
                })
            ), 
        {
            name: 'Resumes',
            storage: createJSONStorage(() => storage), // sau sessionStorage
            partialize: (state) => ({
                CVs: state.CVs
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }), {
            name: 'CVsStore', // Name of the slice in the Redux DevTools
            enabled: import.meta.env.VITE_NODE_ENV === 'development',
        }
    )
)