import { create } from 'zustand';
import { devtools } from "zustand/middleware";
import { ErrorStore, ErrorTypes } from '../interfaces/error_interface';
import { APIError } from '../interfaces/api_interface';

export const useErrorStore = create<ErrorStore>()(
    devtools<ErrorStore>((set, get) => ({
        errors: [],

        addError: (error) => set((state: ErrorStore) => ({ errors: [...state.errors, error] })),
        clearErrors: () => set({ errors: [] }),
        removeError: (index) => set((state: ErrorStore) => ({
            errors: state.errors.filter((_, i) => i !== index)
        })),

        handleAPIError: (error: APIError) => {
            const statusCode = error.response?.status || 500;
            const message = error.message || 'An unexpected error occurred';
            const errors = error.response?.data?.errors;
            const errType = error.response?.data?.errType || ErrorTypes.INTERNAL_ERR;

            const errorObj = {
                statusCode,
                message,
                errors,
                errType
            };

            get().addError(errorObj);
        }
    }), { 
        name: 'error-store', // Name of the slice in the Redux DevTools
        enabled: import.meta.env.VITE_NODE_ENV === 'development',
    })
)