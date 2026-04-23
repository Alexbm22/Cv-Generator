import { useMutation } from '@tanstack/react-query';
import { useAuthStore, useCVsStore, useErrorStore } from '../../Store';
import { AuthResponse, AuthCredentials } from '../../interfaces/auth';
import { APIError } from '../../interfaces/api';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../router/routes';
import * as yup from 'yup';
import { AuthService } from '../../services/auth';
import { useInitialUserDataSync } from '../useUser';

export const useFormSubmission = <T>(
    schema: yup.ObjectSchema<{}, T, {}, "">,
    onSubmit: (formData: T) => void,
    sanitizeData: (data: T) => T
) => {
    return (formData: T) => (e: React.FormEvent<HTMLElement>) => {
        e.preventDefault();

        try {
            schema.validateSync(formData, { abortEarly: false })
            const processedData = sanitizeData ? sanitizeData(formData) : formData
            onSubmit(processedData)
        } catch (error) {
            const form = e.target as HTMLFormElement;
            useErrorStore.getState().handleValidationError(error, form.name!);
        }
    }
}

export const useAuthAndSync = <T extends AuthCredentials>(
    authFunction: (authCredentials: T) => Promise<AuthResponse>,
) => {
    const navigate = useNavigate();
    const { setIsLoadingAuth } = useAuthStore.getState();
    const { mutateAsync: syncGuestData } = useInitialUserDataSync();
    
    return useMutation<AuthResponse, APIError, T>({
        mutationFn: async (authCredentials: T) => {
            setIsLoadingAuth(true); 
            return await authFunction(authCredentials);
        },
        onSuccess: async (authResponse: AuthResponse) => {
            const { handleAuthSuccess } = useAuthStore.getState();
            if (!authResponse.token) {
                return navigate(routes.login.path);
            }

            handleAuthSuccess(authResponse);
            
            if (authResponse.user?.needsInitialSync) {
                await syncGuestData();
            }
        },
        onSettled: () => setIsLoadingAuth(false),
        onError: () => navigate(routes.login.path),
    })
}

export const useLogout = () => {
    const navigate = useNavigate();
    const migrateUserToGuest = useCVsStore(state => state.migrateUserToGuest)  

    return useMutation<void, APIError>({
        mutationFn: async () => await AuthService.logout(),
        onSuccess: () => {
            navigate(routes.login.path);
        },
        onSettled: () => {
            useAuthStore.getState().clearAuthenticatedUser();
            useCVsStore.getState().clearCVsData();
            migrateUserToGuest()
        }
    })
}

export const useCheckAuth = () => {
    const { 
        setIsLoadingAuth, 
        handleAuthSuccess,
        clearAuthenticatedUser,
        setAuthChecked,
    } = useAuthStore.getState();

    const migrateGuestToUser = useCVsStore(state => state.migrateGuestToUser) 
    const migrateUserToGuest = useCVsStore(state => state.migrateUserToGuest)
    const { mutateAsync: syncGuestData } = useInitialUserDataSync();

    return useMutation<AuthResponse, APIError>({
        mutationFn: async () => {
            setIsLoadingAuth(true);
            return await AuthService.checkAuth();
        },
        onSuccess: async (response) => {
            handleAuthSuccess(response);
            migrateGuestToUser();
            if (response.user?.needsInitialSync) {
                await syncGuestData();
            }
        }, 
        onError: (error) => {
            if(error.status === 401) {
                clearAuthenticatedUser();
                migrateUserToGuest();
            } else {
                clearAuthenticatedUser();
            }
        },
        onSettled: () => {
            setIsLoadingAuth(false);
            setAuthChecked(true);
        }
    })
}