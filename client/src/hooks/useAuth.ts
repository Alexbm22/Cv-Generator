import { useMutation } from '@tanstack/react-query';
import { loginDto, registerDto, AuthResponse } from '../interfaces/auth_interface';
import { CredentialResponse } from '@react-oauth/google';
import { apiService } from '../services/api';
import { AxiosError } from 'axios';


export const useGoogleLogin = () => {
    return useMutation<AuthResponse, AxiosError, CredentialResponse>({
        mutationFn: (googleResponse: CredentialResponse) => 
            apiService.post<AuthResponse, CredentialResponse>('/auth/google_login', googleResponse), // sending the id token to the server
        onSuccess: (reponse: AuthResponse) => {
            const token = reponse.data?.token.accessToken;

            if(!token){
                return;
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
        mutationFn: (loginDto: loginDto) => 
            apiService.post<AuthResponse, loginDto>('/auth/login', loginDto),
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
        mutationFn: (registerDto: registerDto) => 
            apiService.post<AuthResponse, registerDto>('/auth/register', registerDto),
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