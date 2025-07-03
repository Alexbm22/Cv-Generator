import { useMutation } from '@tanstack/react-query';
import { useAuthStore, useCVsStore, useErrorStore } from '../Store';
import { AuthResponse, AuthCredentials } from '../interfaces/auth_interface';
import { APIError } from '../interfaces/api_interface';
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
            useErrorStore.getState().handleValidationError(error);
        }
    }
}

// to do an initial data sync with all user settings
export const useInitialDataSync = () => {
    return useMutation({
        mutationFn: async () => {
            const { CVs } = useCVsStore.getState();
            return (await CVServerService.createCVs(CVs)).data ?? [];
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
    const { handleAuthSuccess, setToken } = useAuthStore.getState();

    const navigate = useNavigate();

    return useMutation<void, APIError, T>({
        mutationFn: async (authCredentials: T) => {
            // authenticate the user on the server side 
            const authResponse = await authFunction(authCredentials);
            setToken(authResponse.data?.token!);

            if(authResponse.data?.firstAuth) {                
                // sync the user data 
                await new Promise<void>((resolve, reject) => {
                    mutateSync(undefined, {
                        onSuccess: () => resolve(),
                        onError: (error) => reject(error)
                    });
                });
            }

            // handle auth after syncing data 
            handleAuthSuccess(authResponse);
        },
        onSuccess: () => {
            navigate(routes.resumes.path, { replace: true });
        }
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
            const { handleAuthSuccess } = useAuthStore.getState();
            handleAuthSuccess(response);
        }
    })
}