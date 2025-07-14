import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { UserStore, UserObj } from '../interfaces/user';

export const useUserStore = create<UserStore>()(
    devtools(
        (set, get) => ({
            username: null,
            email: null,
            profilePicture: null,
            
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
            getUserObj: () => {
                return {
                    username: get().username,
                    email: get().email,
                    profilePicture: get().profilePicture
                }
            },
        }), {
            name: 'UserStore', // Name of the slice in the Redux DevTools
            enabled: import.meta.env.VITE_NODE_ENV === 'development',
        }
    )
)