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
        needsInitialSync: false,

        isAuthenticated: false,
        isLoadingAuth: true,
        isAuthChecked: false,
        tokenData: null,    

        clearAuthenticatedUser: () => {
            useUserStore.getState().clearUserProfile(); 
            
            set({ 
                id: null,
                username: null,
                email: null,
                profilePicture: null,
                needsInitialSync: false,
                isAuthenticated: false, 
                tokenData: null, 
            })
        },

        getAuthenticatedUser: () => {
            const { id, username, email, profilePicture, needsInitialSync } = get();
            return { id, username, email, profilePicture, needsInitialSync };
        },

        setIsLoadingAuth: (isLoadingAuth: boolean) => set({ isLoadingAuth }),
        setAuthChecked: (isAuthChecked: boolean) => set({ isAuthChecked }),
        setUserData: (userData) => set({
            id: userData.id,
            username: userData.username,
            email: userData.email,
            profilePicture: userData.profilePicture,
            needsInitialSync: userData.needsInitialSync
        }),

        handleAuthSuccess(authData) {
            if(authData.token) {
                set({  
                    tokenData: {
                        token: authData.token?.token,
                        expiresIn: authData.token.expiresIn
                    },
                    isAuthenticated: true, 
                    isAuthChecked: true,
                    isLoadingAuth: false,
                    id: authData.user?.id,
                    username: authData.user?.username,
                    email: authData.user?.email,
                    profilePicture: authData.user?.profilePicture,
                    needsInitialSync: authData.user?.needsInitialSync ?? false
                })
            }
        },

        setToken: (token: TokenClientData) => set({ tokenData: token }),

        isTokenExpired: () => {
            const { tokenData } = get();
            return tokenData ? new Date() >= tokenData.expiresIn : true;
        },

    }), { 
        name: 'auth-store', // Name of the slice in the Redux DevTools
        enabled: import.meta.env.VITE_NODE_ENV === 'development',
    })
)