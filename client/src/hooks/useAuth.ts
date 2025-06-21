import { useMutation } from '@tanstack/react-query';
import { CredentialResponse } from '@react-oauth/google';
import { useUserStore, useAuthStore } from '../Store';
import { loginDto, registerDto, AuthResponse } from '../interfaces/auth_interface';
import { APIError } from '../interfaces/api_interface';
import { useNavigate } from 'react-router-dom';
import { routes } from '../config/routes';

export const useGoogleLogin = () => {
    
    const navigate = useNavigate();

    return useMutation<AuthResponse, APIError, CredentialResponse>({
        mutationFn: async (googleResponse: CredentialResponse) => await useAuthStore.getState().googleLogin(googleResponse),
        onSuccess: (response: AuthResponse) => {
            const { setAuthState } = useAuthStore.getState();
            const { setUserData } = useUserStore.getState();
            const token = response.data?.token;
            const userData = response.data?.user;

            if(token && userData) {
              setAuthState(token);
              setUserData(userData)
            }

            navigate(routes.editResume.path, { replace: true });
        },
    })
}

export const useLogin = () => {

    const navigate = useNavigate();

    return useMutation<AuthResponse, APIError, loginDto>({
        mutationFn: async (loginDto: loginDto) => await useAuthStore.getState().login(loginDto),
        onSuccess: (response: AuthResponse) => {
            const { setAuthState } = useAuthStore.getState();
            const { setUserData } = useUserStore.getState();
            const token = response.data?.token;
            const userData = response.data?.user;

            if(token && userData) {
              setAuthState(token);
              setUserData(userData)
            }

            navigate(routes.editResume.path, { replace: true });
        },
    })
}

export const useRegistration = () => {

    const navigate = useNavigate();

    return useMutation<AuthResponse, APIError, registerDto>({
        mutationFn: async (registerDto: registerDto) => await useAuthStore.getState().register(registerDto),
        onSuccess: (response: AuthResponse) => {
            const { setAuthState } = useAuthStore.getState();
            const { setUserData } = useUserStore.getState();
            const token = response.data?.token;
            const userData = response.data?.user;

            if(token && userData) {
              setAuthState(token);
              setUserData(userData)
            }

            navigate(routes.editResume.path, { replace: true });
        },
    })
}

export const useLogout = () => {

    const navigate = useNavigate();

    return useMutation<AuthResponse, APIError>({
        mutationFn: async () => await useAuthStore.getState().logout(),
        onSuccess: () => {
            navigate(routes.login.path, { replace: true });
        }
    })
}

export const useCheckAuth = () => {
    return useMutation<AuthResponse, APIError>({
        mutationFn: async () => await useAuthStore.getState().checkAuth(),
        onSuccess: (response) => {
            const { setAuthState } = useAuthStore.getState();
            const { setUserData } = useUserStore.getState();
            const token = response.data?.token;
            const userData = response.data?.user;

            if(token && userData) {
              setAuthState(token);
              setUserData(userData)
            }
        }
    })
}