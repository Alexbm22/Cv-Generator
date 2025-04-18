import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { 
    CVAttributes,
} from '../interfaces/cv_interface';
import { UserStore } from '../interfaces/user_interface';

export const useUserStore = create<UserStore>()(
    devtools(
        persist((set) => ({
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
            setCVs: (CVs: CVAttributes[]) => set({ CVs })
        }), {
            name: 'resumes',
            partialize: (state) => ({
                CVs: state.CVs,
            }),
        })
    )
)