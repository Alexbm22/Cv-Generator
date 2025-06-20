import { create } from 'zustand';
import { devtools } from "zustand/middleware";
import { AuthResponse, AuthStore, TokenClientData } from '../interfaces/auth_interface'
import { UserObj } from '../interfaces/user_interface';
import { apiService } from '../services/api';
import { useUserStore } from './useUserStore';
import { AxiosError } from 'axios';

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
        },

        logout: async () => {
            const { getUserObj, clearUserData } = useUserStore.getState();

            try {
                await apiService.post<AuthResponse, UserObj>('/auth/logout', getUserObj());
            } catch (error) {
                if (error instanceof AxiosError) {
                    // to implement logging error handling 
                    console.error('Logout failed:', error.message);
                }
                throw error;
            } finally {
                get().clearAuth();
                clearUserData(); 

                // to be improved: this is a workaround to redirect to login page
                if(window.location.pathname !== '/login') {
                    window.location.href = '/login'; // Redirect to login page
                }
            }
        }
    }), { 
        name: 'auth-store', // Name of the slice in the Redux DevTools
        enabled: import.meta.env.VITE_NODE_ENV === 'development',
    })
)