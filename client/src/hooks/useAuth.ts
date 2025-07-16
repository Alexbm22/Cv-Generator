import { useMutation } from '@tanstack/react-query';
import { useAuthStore, useCVsStore, useErrorStore } from '../Store';
import { AuthResponse, AuthCredentials } from '../interfaces/auth';
import { APIError } from '../interfaces/api';
import { useNavigate } from 'react-router-dom';
import { routes } from '../router/routes';
import { CVServerService } from '../services/CVServer';
import * as yup from 'yup';

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

// to do an initial data sync with all user settings
export const useInitialDataSync = () => {
    return useMutation({
        mutationFn: async () => {
            const { CVs } = useCVsStore.getState();
            return (await CVServerService.createCVs(CVs)) ?? [];
        },
        onSuccess: (CVs) => {
            const { setFetchedCVs } = useCVsStore.getState();
            setFetchedCVs(CVs);
        },
    })
}

export const useAuthAndSync =  <T extends AuthCredentials>(
    authFunction: (authCredentials: T) => Promise<AuthResponse>
) => {

    const { mutate: mutateSync } = useInitialDataSync();  
    const { handleAuthSuccess, setToken, setIsLoadingAuth } = useAuthStore.getState();

    return useMutation<void, APIError, T>({
        mutationFn: async (authCredentials: T) => {
            // authenticate the user on the server side
            setIsLoadingAuth(true); 
            const authResponse = await authFunction(authCredentials);
            setToken(authResponse.token!);

            if(authResponse.firstAuth) {                
                // sync the user data 
                mutateSync();
            }
            // handle auth after syncing data 
            handleAuthSuccess(authResponse);
        },
        onSettled: () => setIsLoadingAuth(false),
    })
}

export const useLogout = () => {

    const navigate = useNavigate();

    return useMutation<AuthResponse, APIError>({
        mutationFn: async () => await useAuthStore.getState().logout(),
        onSuccess: () => {
            navigate(routes.login.path, { replace: true });
        },
        onSettled: () => {
            useAuthStore.getState().clearAuthenticatedUser();
        }
    })
}

export const useCheckAuth = () => {
    return useMutation<AuthResponse, APIError>({
        mutationFn: async () => {
            useAuthStore.getState().setIsLoadingAuth(true);
            return await useAuthStore.getState().checkAuth()
        },
        onSuccess: (response) => {
            const { handleAuthSuccess } = useAuthStore.getState();
            handleAuthSuccess(response);
        }, 
        onError: () => {
            useAuthStore.getState().clearAuthenticatedUser();
        },
        onSettled: () => {
            useAuthStore.getState().setIsLoadingAuth(false);
        }
    })
}