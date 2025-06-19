import { useMutation } from '@tanstack/react-query';
import { loginDto, registerDto, AuthResponse } from '../interfaces/auth_interface';
import { CredentialResponse } from '@react-oauth/google';
import { apiService } from '../services/api';
import { AxiosError } from 'axios';
import { useAuthStore } from '../Store/useAuthStore';
import { useUserStore } from '../Store';

export const useGoogleLogin = () => {
    return useMutation<AuthResponse, AxiosError, CredentialResponse>({
        mutationFn: async (googleResponse: CredentialResponse) => 
            await apiService.post<AuthResponse, CredentialResponse>('/auth/google_login', googleResponse), // sending the id token to the server
        onSuccess: (response: AuthResponse) => {
            if(!response.data) return;

           const { setAuthState } = useAuthStore.getState();
            const { setUserData } = useUserStore.getState();
            const token = response.data?.token;
            const userData = response.data?.user;

            if(token && userData) {
              setAuthState(token);
              setUserData(userData)
            }
        },
        onError: (error) => {
            // To do: Handle login error
            console.error('Login failed:', error);
        }
    })
}

export const useLogin = () => {
    return useMutation<AuthResponse, AxiosError, loginDto>({
        mutationFn: async (loginDto: loginDto) => 
            await apiService.post<AuthResponse, loginDto>('/auth/login', loginDto),
        onSuccess: (reponse: AuthResponse) => {
            const token = reponse.data?.token.accessToken
            if(!token){
                return;
            }

            localStorage.setItem('accessToken', token);
        },
        onError: (error) => {
            // To do: Handle login error
            console.error('Login failed:', error);
        }
    })
}

export const useRegistration = () => {
    return useMutation<AuthResponse, AxiosError, registerDto>({
        mutationFn: async (registerDto: registerDto) => 
            await apiService.post<AuthResponse, registerDto>('/auth/register', registerDto),
        onSuccess: (reponse: AuthResponse) => {
            const token = reponse.data?.token.accessToken
            if(!token){
                return;
            }

            localStorage.setItem('accessToken', token);
        },
        onError: (error) => {
            // To do: Handle login error
            console.error('Registration failed:', error);
        } 
    })
}