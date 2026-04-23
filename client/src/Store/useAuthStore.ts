import { create } from 'zustand';
import { devtools } from "zustand/middleware";
import { AuthStore, TokenClientData } from '../interfaces/auth'
import { useUserStore } from './useUserStore';
import { UserAttributes } from '../interfaces/user';

export const useAuthStore = create<AuthStore>()(
    devtools<AuthStore>((set, get) => ({
        id: null,
        username: null,
        email: null,
        profilePictureId: null,
        needsInitialSync: false,
        authProvider: null,

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
                profilePictureId: null,
                needsInitialSync: false,
                authProvider: null,
                isAuthenticated: false, 
                tokenData: null, 
            })
        },

        getAuthenticatedUser: () => {
            const { id, username, email, profilePictureId, needsInitialSync, authProvider } = get();
            return { id, username, email, profilePictureId, needsInitialSync, authProvider } as UserAttributes;
        },

        setIsLoadingAuth: (isLoadingAuth: boolean) => set({ isLoadingAuth }),
        setAuthChecked: (isAuthChecked: boolean) => set({ isAuthChecked }),
        setUserData: (userData) => set({
            id: userData.id,
            username: userData.username,
            email: userData.email,
            profilePictureId: userData.profilePictureId,
            needsInitialSync: userData.needsInitialSync,
            authProvider: userData.authProvider
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
                    id: authData.user?.id,
                    username: authData.user?.username,
                    email: authData.user?.email,
                    profilePictureId: authData.user?.profilePictureId,
                    needsInitialSync: authData.user?.needsInitialSync ?? false,
                    authProvider: authData.user?.authProvider ?? null,
                })
            }
        },

        setToken: (token: TokenClientData) => set({ tokenData: token }),

        setProfilePictureId: (profilePictureId) => set({ profilePictureId }),

        isTokenExpired: () => {
            const { tokenData } = get();
            return tokenData ? new Date() >= tokenData.expiresIn : true;
        },

    }), { 
        name: 'auth-store', // Name of the slice in the Redux DevTools
        enabled: import.meta.env.VITE_NODE_ENV === 'development',
    })
)