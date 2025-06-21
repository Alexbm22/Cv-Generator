import { create } from 'zustand';
import { devtools } from "zustand/middleware";
import { AuthResponse, AuthStore, loginDto, registerDto, TokenClientData } from '../interfaces/auth_interface'
import { UserObj } from '../interfaces/user_interface';
import { apiService } from '../services/api';
import { useUserStore } from './useUserStore';
import { CredentialResponse } from '@react-oauth/google';
import { routes } from '../config/routes';

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
        }),

        clearAuth: () => set({ 
            isAuthenticated: false, 
            token: null, 
        }),

        isTokenExpired: () => {
            const { token } = get();
            return token ? new Date() >= token.tokenExpiry : true;
        },

        googleLogin: async (googleResponse: CredentialResponse): Promise<AuthResponse> => {
            return await apiService.post<AuthResponse, CredentialResponse>(
                '/auth/google_login', 
                googleResponse
            ) // sending the id token to the server
        },

        login: async (loginDto: loginDto): Promise<AuthResponse> => {
            return await apiService.post<AuthResponse, loginDto>('/auth/login', loginDto);
        },

        register: async (registerDto: registerDto): Promise<AuthResponse> => {
            return await apiService.post<AuthResponse, registerDto>('/auth/register', registerDto);
        },

        logout: async (): Promise<AuthResponse> => {
            const { getUserObj, clearUserData } = useUserStore.getState();

            get().clearAuth();
            clearUserData(); 

            return await apiService.post<AuthResponse, UserObj>('/auth/logout', getUserObj());
        },

        forceLogout: async () => {
            await get().logout();

            if(window.location !== undefined){
                window.location.href = routes.login.path; // Redirect to login page
            }
        },

        checkAuth: async (): Promise<AuthResponse> => {
            return await apiService.get<AuthResponse>('/auth/check_auth');
        }

    }), { 
        name: 'auth-store', // Name of the slice in the Redux DevTools
        enabled: import.meta.env.VITE_NODE_ENV === 'development',
    })
)