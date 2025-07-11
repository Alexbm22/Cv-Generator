import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { 
    CVAttributes,
    CVStore,
} from '../interfaces/cv_interface';
import { useAuthStore } from './useAuthStore';
import { withFunctionCallExcept } from './middleware/withFunctionCallExcept';
import { removeCVById , setIndexedDbCVs  } from '../lib/indexedDB/cvStore';
import { CVLocalService } from '../services/CVLocal';

export const useCVsStore = create<CVStore>()(
    devtools(
        persist( 
            withFunctionCallExcept<CVStore>(
                CVLocalService.persistAllCVs,
                [ 'setCVs', 'setdbHydrated', 'setFetchedCVs', 'setLastSynced', 'isSyncStale'] // Exclude these actions from the middleware
            )(
                (set, get) => ({
                    CVs: [],
                    lastSynced: null,
                    dbHydrated: false,

                    clearCVsData: () => {
                        set({
                            CVs: [],
                            lastSynced: null,
                            dbHydrated: false
                        })
                    },
                    setLastSynced: (time: number) => set({ lastSynced: time }),
                    isSyncStale: () => {
                        const now = new Date().getTime();
                        const lastSynced = get().lastSynced;
                        const maximumStalePeriod = 0.5 * 60 * 1000; // 1 minutes

                        if(!lastSynced) return true;

                        return (now - lastSynced) > maximumStalePeriod;
                    },
                    getChangedCVs: () => {
                        const { lastSynced, CVs } = get();
                        
                        const changedCVs = CVs.filter((cv) => 
                            cv.updatedAt && cv.updatedAt > lastSynced!
                        )

                        return changedCVs;
                    },

                    setdbHydrated: (dbHydrated: boolean) => set({ dbHydrated: dbHydrated }),
                    
                    setFetchedCVs: (CVs: CVAttributes[]) => {
                        const { setdbHydrated, setCVs, setLastSynced } = get();
                        
                        setLastSynced(new Date().getTime());
                        setIndexedDbCVs(CVs); 
                        setCVs(CVs);
                        setdbHydrated(true);
                    },
                    
                    setCVs: (CVs: CVAttributes[]) => set({ CVs }),

                    addCV: (CV: CVAttributes) => {
                        set((state) => ({ CVs: state.CVs.concat(CV) }));
                    },

                    removeCV: (id: string) => {
                        if(useAuthStore.getState().isAuthenticated){
                            removeCVById (id); // Delete from IndexedDB
                        }
                        set((state) => ({ CVs: state.CVs.filter((cv) => cv.id !== id) }))
                    },

                    updateCV: (updatedCV: CVAttributes) => {
                        if (get().CVs.some((cv) => cv.id === updatedCV.id)) {
                            set((state) => ({ CVs: state.CVs.map((cv) => (cv.id === updatedCV.id ? updatedCV : cv)) }))
                        } else { 
                            get().addCV(updatedCV);
                        }
                    },

        })), {
            name: 'Resumes',
            partialize: (state) => {
                const { isAuthenticated } = useAuthStore.getState();

                const persisted = isAuthenticated ? { lastSynced: state.lastSynced } : { 
                    CVs: state.CVs
                } 

                return persisted;
            },
        }), {
            name: 'CVsStore', // Name of the slice in the Redux DevTools
            enabled: import.meta.env.VITE_NODE_ENV === 'development',
        }
    )
)