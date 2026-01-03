import { useMutation } from '@tanstack/react-query';
import { useAuthStore, useCVsStore, useErrorStore } from '../../Store';
import { AuthResponse, AuthCredentials } from '../../interfaces/auth';
import { APIError } from '../../interfaces/api';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../router/routes';
import * as yup from 'yup';
import { AuthService } from '../../services/auth';
import { useInitialCVsSync } from '../CVs/useCVs';

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
    authFunction: (authCredentials: T) => Promise<AuthResponse>
) => {
    const { mutate: mutateSync } = useInitialCVsSync();
    const migrateGuestToUser = useCVsStore(state => state.migrateGuestToUser)  
    
    return useMutation<void, APIError, T>({
        mutationFn: async (authCredentials: T) => {
            const { handleAuthSuccess, setToken, setIsLoadingAuth } = useAuthStore.getState();
            
            // authenticate the user on the server side
            setIsLoadingAuth(true); 
            const authResponse = await authFunction(authCredentials);
            setToken(authResponse.token!);

            if(authResponse.firstAuth) {                
                // sync the user data 
                mutateSync();
            } else {
                migrateGuestToUser();
            }

            // handle auth after syncing data 
            if(authResponse.token) handleAuthSuccess(authResponse);
        },
        onSettled: () => useAuthStore.getState().setIsLoadingAuth(false),
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
    } = useAuthStore.getState();

    const migrateGuestToUser = useCVsStore(state => state.migrateGuestToUser) 
    const migrateUserToGuest = useCVsStore(state => state.migrateUserToGuest) 

    return useMutation<AuthResponse, APIError>({
        mutationFn: async () => {
            setIsLoadingAuth(true);
            return await AuthService.checkAuth();
        },
        onSuccess: (response) => {
            handleAuthSuccess(response);
            migrateGuestToUser();
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
        }
    })
}