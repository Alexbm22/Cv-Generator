import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { 
    CVAttributes,
} from '../interfaces/cv_interface';
import { useAuthStore } from './useAuthStore';
import { UserStore, UserObj } from '../interfaces/user_interface';

export const useUserStore = create<UserStore>()(
    devtools(
        persist((set, get) => ({
            username: null,
            email: null,
            profilePicture: null,
            CVs: [],
            
            setUserName: (username: string) => set({ username }),
            setUserEmail: (email: string) => set({ email }),
            setProfilePicture: (profilePicture: string) => set({ profilePicture }),
            setUserData: (userData: UserObj) => set((state) => ({
                ...state,
                ...userData
            })),
            clearUserData: () => set({
                username: null,
                email: null,
                profilePicture: null
            }),

            addCV: (CV: CVAttributes) => set((state) => ({ CVs: state.CVs.concat(CV) })),
            removeCV: (id: string) => set((state) => ({ CVs: state.CVs.filter((cv) => cv.id !== id) })),
            updateCV: (updatedCV: CVAttributes) => {
                if (get().CVs.some((cv) => cv.id === updatedCV.id)) {
                    set((state) => ({ CVs: state.CVs.map((cv) => (cv.id === updatedCV.id ? updatedCV : cv)) }))
                } else { 
                    get().addCV(updatedCV);
                }
            }
        }), {
            name: 'resumes',
            partialize: (state) => {
                // Only persist CVs if user is NOT authenticated
                const isAuthenticated = useAuthStore.getState().isAuthenticated;
                return isAuthenticated ? {} : { CVs: state.CVs };
            },
        }), {
            name: 'UserStore', // Name of the slice in the Redux DevTools
            enabled: import.meta.env.VITE_NODE_ENV === 'development',
        }
    )
)