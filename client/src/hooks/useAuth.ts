import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { loginDto, registerDto, AuthResponse } from '../interfaces/auth_interface';
import { CredentialResponse } from '@react-oauth/google';
import { apiService } from '../services/api';
import { AxiosError } from 'axios';

const navigate = useNavigate();

export const useGoogleLogin = () => {
    return useMutation<AuthResponse, AxiosError, CredentialResponse>({
        mutationFn: (googleResponse: CredentialResponse) => 
            apiService.post<AuthResponse, string>('/api/auth/google_login', googleResponse.credential),
        onSuccess: (data: AuthResponse) => {
            navigate(-1)
            //to do: improve the logic
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
            apiService.post<AuthResponse, loginDto>('/api/auth/login', loginDto),
        onSuccess: (data: AuthResponse) => {
            navigate(-1)
            //to do: improve the logic
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
            apiService.post<AuthResponse, registerDto>('/api/auth/register', registerDto),
        onSuccess: (data: AuthResponse) => {
            navigate(-1)
            //to do: improve the logic
        },
        onError: (error) => {
            // To do: Handle login error
            console.error('Registration failed:', error);
        } 
    })
}