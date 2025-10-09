import { create } from 'zustand';
import { devtools } from "zustand/middleware";
import { AuthStore, TokenClientData } from '../interfaces/auth'
import { useUserStore } from './useUserStore';

export const useAuthStore = create<AuthStore>()(
    devtools<AuthStore>((set, get) => ({
        id: null,
        username: null,
        email: null,
        profilePicture: null,

        isAuthenticated: false,
        isLoadingAuth: true,
        token: null,

        clearAuthenticatedUser: () => {
            const { clearUserProfile } = useUserStore.getState();
            
            clearUserProfile(); 
            set({ 
                id: null,
                username: null,
                email: null,
                profilePicture: null,
                isAuthenticated: false, 
                token: null, 
            })
        },

        setIsLoadingAuth: (isLoadingAuth: boolean) => set({ isLoadingAuth }),
        setUserData: (userData) => set({
            id: userData.id,
            username: userData.username,
            email: userData.email,
            profilePicture: userData.profilePicture
        }),

        handleAuthSuccess(authData) {
            if(authData.token) {
                set({  
                    token: {
                        accessToken: authData.token.accessToken,
                        tokenExpiry: authData.token.tokenExpiry
                    },
                    isAuthenticated: true, 
                    id: authData.user.id,
                    username: authData.user.username,
                    email: authData.user.email,
                    profilePicture: authData.user.profilePicture
                })
            }
        },

        setToken: (token: TokenClientData) => set({token: token}),

        isTokenExpired: () => {
            const { token } = get();
            return token ? new Date() >= token.tokenExpiry : true;
        },

    }), { 
        name: 'auth-store', // Name of the slice in the Redux DevTools
        enabled: import.meta.env.VITE_NODE_ENV === 'development',
    })
)