import { create } from 'zustand';
import { devtools } from "zustand/middleware";
import { AuthResponse, AuthStore, loginDto, registerDto, TokenClientData } from '../interfaces/auth_interface'
import { useUserStore } from './useUserStore';
import { CredentialResponse } from '@react-oauth/google';
import { routes } from '../router/routes';
import { AuthService } from '../services/auth';

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

        handleAuthSuccess(authResponse: AuthResponse) {
            const setAuthState = get().setAuthState;
            const { setUserData } = useUserStore.getState();
            const token = authResponse.data?.token;
            const userData = authResponse.data?.user;

            if(token && userData) {
              setAuthState(token);
              setUserData(userData)
            }
        },

        setToken: (token: TokenClientData) => set({token: token}),

        isTokenExpired: () => {
            const { token } = get();
            return token ? new Date() >= token.tokenExpiry : true;
        },

        googleLogin: async (googleResponse: CredentialResponse): Promise<AuthResponse> => {
            return await AuthService.googleLogin(googleResponse);
        },

        login: async (loginDto: loginDto): Promise<AuthResponse> => {
            return await AuthService.login(loginDto);
        },

        register: async (registerDto: registerDto): Promise<AuthResponse> => {
            return await AuthService.register(registerDto);
        },

        logout: async (): Promise<AuthResponse> => {
            const { getUserObj, clearUserData } = useUserStore.getState();

            get().clearAuth();
            clearUserData(); 

            return await AuthService.logout(getUserObj());
        },

        forceLogout: async () => {
            await get().logout();

            if(window.location !== undefined){
                window.location.href = routes.login.path; // Redirect to login page
            }
        },

        checkAuth: async (): Promise<AuthResponse> => {
            return await AuthService.checkAuth();
        }

    }), { 
        name: 'auth-store', // Name of the slice in the Redux DevTools
        enabled: import.meta.env.VITE_NODE_ENV === 'development',
    })
)