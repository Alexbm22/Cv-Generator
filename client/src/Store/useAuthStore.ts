import { create } from 'zustand';
import { devtools } from "zustand/middleware";
import { AuthStore, TokenClientData } from '../interfaces/auth_interface'

export const useAuthStore = create<AuthStore>()(
    devtools<AuthStore>((set, get) => ({
        isAuthenticated: false,
        isLoadingAuth: false,
        token: null,

        setIsLoadingAuth: (isLoadingAuth: boolean) => set({ isLoadingAuth }),
        setAuthState: (token: TokenClientData) => set({  
            token: {
                accessToken: token.accessToken,
                tokenExpiry: token.tokenExpiry
            },
            isAuthenticated: true, 
            isLoadingAuth: false 
        }),
        clearAuth: () => set({ 
            isAuthenticated: false, 
            token: null, 
            isLoadingAuth: false 
        }),
        isTokenExpired: () => {
            const { token } = get();
            return token ? new Date() >= token.tokenExpiry : true;
        }
    }), { 
        name: 'auth-store', // Name of the slice in the Redux DevTools
        enabled: import.meta.env.VITE_NODE_ENV === 'development',
    })
)