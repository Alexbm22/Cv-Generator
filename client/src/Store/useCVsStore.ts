import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { persist, devtools } from 'zustand/middleware';
import { 
    CVAttributes,
    CVStore,
} from '../interfaces/cv_interface';
import { useAuthStore } from './useAuthStore';
import { withFunctionCallExcept } from './middleware/withFunctionCallExcept';
import { removeCVById , loadAllCVs  } from '../lib/indexedDB/cvStore';

export const useCVsStore = create<CVStore>()(
    devtools(
        persist( 
            withFunctionCallExcept<CVStore>(
                loadAllCVs , // to do: resolve the saving error
                [ 'setCVs', 'setdbHydrated' ] // Exclude these actions from the middleware
            )(
                (set, get) => ({
                    CVs: [],
                    dbHydrated: false,

                    setdbHydrated: (dbHydrated: boolean) => set({ dbHydrated: dbHydrated }),
                    addCV: (CV: CVAttributes) => {
                        CV.id = uuidv4();
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

                    setCVs: (CVs: CVAttributes[]) => set({ CVs }),

        })), {
            name: 'Resumes',
            partialize: (state) => {
                const { isAuthenticated } = useAuthStore.getState();
                const persisted = isAuthenticated ? {} : { CVs: state.CVs } 
                return persisted;
            },
        }), {
            name: 'CVsStore', // Name of the slice in the Redux DevTools
            enabled: import.meta.env.VITE_NODE_ENV === 'development',
        }
    )
)