import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { 
    CVAttributes,
} from '../interfaces/cv_interface';
import { UserStore } from '../interfaces/user_interface';

export const useUserStore = create<UserStore>()(
    devtools(
        persist((set, get) => ({
            userName: null,
            userEmail: null,
            userId: null,
            userProfilePicture: null,
            userAuthProvider: null,
            userisAuthenticated: false,
            CVs: [],
            setUserName: (userName: string) => set({ userName }),
            setUserEmail: (userEmail: string) => set({ userEmail }),
            setUserId: (userId: number) => set({ userId }),
            setUserProfilePicture: (userProfilePicture: string) => set({ userProfilePicture }),
            setUserAuthProvider: (userAuthProvider: 'local' | 'google') => set({ userAuthProvider }),
            setUserisAuthenticated: (userisAuthenticated: boolean) => set({ userisAuthenticated }),

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
            partialize: (state) => ({
                CVs: state.CVs,
            }),
        })
    )
)