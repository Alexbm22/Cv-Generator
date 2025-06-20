import { useMutation } from '@tanstack/react-query';
import { CredentialResponse } from '@react-oauth/google';
import { apiService } from '../services/api';
import { useUserStore, useAuthStore, useErrorStore } from '../Store';
import { loginDto, registerDto, AuthResponse } from '../interfaces/auth_interface';
import { APIError } from '../interfaces/api_interface';

export const useGoogleLogin = () => {
    return useMutation<AuthResponse, APIError, CredentialResponse>({
        mutationFn: async (googleResponse: CredentialResponse) => {
            try {
                return await apiService.post<AuthResponse, CredentialResponse>(
                    '/auth/google_login', 
                    googleResponse
                ) // sending the id token to the server
            } catch (error) {
                throw error;
            }
        },
        onSuccess: (response: AuthResponse) => {
            const { setAuthState } = useAuthStore.getState();
            const { setUserData } = useUserStore.getState();
            const token = response.data?.token;
            const userData = response.data?.user;

            if(token && userData) {
              setAuthState(token);
              setUserData(userData)
            }
        },
        onError: (error: APIError) => {
            const { handleAPIError } = useErrorStore.getState();
            handleAPIError(error);
        },
    })
}

export const useLogin = () => {
    return useMutation<AuthResponse, APIError, loginDto>({
        mutationFn: async (loginDto: loginDto) => {
            try {
               return await apiService.post<AuthResponse, loginDto>('/auth/login', loginDto);
            } catch (error) {
                throw error;
            }
        },
        onSuccess: (response: AuthResponse) => {
            const { setAuthState } = useAuthStore.getState();
            const { setUserData } = useUserStore.getState();
            const token = response.data?.token;
            const userData = response.data?.user;

            if(token && userData) {
              setAuthState(token);
              setUserData(userData)
            }
        },
        onError: (error: APIError) => {
            const { handleAPIError } = useErrorStore.getState();
            handleAPIError(error);
        },
    })
}

export const useRegistration = () => {
    return useMutation<AuthResponse, APIError, registerDto>({
        mutationFn: async (registerDto: registerDto) => {
            try {
                return await apiService.post<AuthResponse, registerDto>('/auth/register', registerDto);
            } catch (error) {
                throw error;
            }
        },
        onSuccess: (response: AuthResponse) => {
            const { setAuthState } = useAuthStore.getState();
            const { setUserData } = useUserStore.getState();
            const token = response.data?.token;
            const userData = response.data?.user;

            if(token && userData) {
              setAuthState(token);
              setUserData(userData)
            }
        },
        onError: (error: APIError) => {
            const { handleAPIError } = useErrorStore.getState();
            handleAPIError(error);
        },
    })
}