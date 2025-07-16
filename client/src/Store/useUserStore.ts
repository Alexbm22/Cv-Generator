import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { UserProfile, UserStore } from '../interfaces/user';

export const useUserStore = create<UserStore>()(
    devtools(
        (set, get) => ({
            username: null,
            email: null,
            profilePicture: null,
            subscription: null,
            credits: 0,
            payments: [],
            
            setUserProfile: (userProfileData) => set((state) => ({
                ...state,
                ...userProfileData
            })),
            clearUserProfile: () => set({
                username: null,
                email: null,
                profilePicture: null,
                subscription: null,
                credits: 0,
                payments: [],
            }),
            getUserProfile: () => {
                const store = get();
                const profileData = Object.fromEntries(
                    Object.entries(store).filter(([_, value]) => typeof value !== 'function')
                ) as UserProfile

                return profileData;
            },
        }), {
            name: 'UserStore', // Name of the slice in the Redux DevTools
            enabled: import.meta.env.VITE_NODE_ENV === 'development',
        }
    )
)