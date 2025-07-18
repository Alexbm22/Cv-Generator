import { create } from 'zustand';
import { devtools } from "zustand/middleware";
import { AuthStore, TokenClientData } from '../interfaces/auth'
import { useUserStore } from './useUserStore';

export const useAuthStore = create<AuthStore>()(
    devtools<AuthStore>((set, get) => ({
        isAuthenticated: false,
        isLoadingAuth: true,
        token: null,

        clearAuthenticatedUser: () => {
            const { clearUserProfile } = useUserStore.getState();
            clearUserProfile(); 

            set({ 
                isAuthenticated: false, 
                token: null, 
            })
        },

        setIsLoadingAuth: (isLoadingAuth: boolean) => set({ isLoadingAuth }),

        handleAuthSuccess(token: TokenClientData) {
            if(token) {
                set({  
                    token: {
                        accessToken: token.accessToken,
                        tokenExpiry: token.tokenExpiry
                    },
                    isAuthenticated: true, 
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