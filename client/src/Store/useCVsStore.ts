import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { persist, devtools } from 'zustand/middleware';
import { 
    CVAttributes,
    CVStore,
} from '../interfaces/cv_interface';
import { useAuthStore } from './useAuthStore';
import { withFunctionCallExcept } from './middleware/withFunctionCallExcept';
import { removeCVById , persistAllCVs  } from '../lib/indexedDB/cvStore';
import { apiService } from '../services/api';
import { ApiResponse } from '../interfaces/api_interface';

export const useCVsStore = create<CVStore>()(
    devtools(
        persist( 
            withFunctionCallExcept<CVStore>(
                persistAllCVs,
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

                    syncToServer: async () => {
                        return await apiService.post<ApiResponse<null>, CVAttributes[]>(
                            '/protected/sync_CVs',
                            get().CVs
                        )
                    },

                    fetchFromServer: async () => {
                        return await apiService.post<ApiResponse<null>>(
                            '/protected/get_CVs'
                        )
                    },

                    createNewCV: async () => {
                        return await apiService.post<ApiResponse<CVAttributes>>(
                            '/protected/create_CV'
                        )
                    },

                    createCVs: async () => {
                        return await apiService.post<ApiResponse<null>, CVAttributes[]>(
                            '/protected/create_existing_CVs',
                            get().CVs
                        )
                    },

                    deleteCV: async (CVId: string) => {
                        return await apiService.post<ApiResponse<null>, string>(
                            '/protected/delete_CV',
                            CVId
                        )
                    },

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