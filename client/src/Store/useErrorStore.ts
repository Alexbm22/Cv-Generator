import { create } from 'zustand';
import { devtools } from "zustand/middleware";
import { ErrorStore } from '../interfaces/error_interface';
import * as yup from'yup'
import { AppError } from "../services/Errors"

export const useErrorStore = create<ErrorStore>()(
    devtools<ErrorStore>((set) => ({
        errors: [],

        addError: (error) => set((state: ErrorStore) => ({ errors: [...state.errors, error] })),
        clearErrors: () => set({ errors: [] }),
        removeError: (index) => set((state: ErrorStore) => ({
            errors: state.errors.filter((_, i) => i !== index)
        })),

        removeFieldError: (field: string) => {
            set((state) => ({
                errors: state.errors.filter((error) => error.field !== field)
            }))
        },

        handleValidationError: (error: unknown) => {
            if (error instanceof yup.ValidationError) {
                const { addError } = useErrorStore.getState();

                // Extract unique field errors (first error per field)
                const fieldErrors = error.inner.reduce<AppError[]>((acc, validationError) => {
                    if (!acc.some(err => err.field === validationError.path)) {
                        acc.push(AppError.validation(validationError.message, validationError.path!));
                    }
                    return acc;
                }, []);
                
                fieldErrors.forEach(err => addError(err));
            }
        }
    }), { 
        name: 'error-store', // Name of the slice in the Redux DevTools
        enabled: import.meta.env.VITE_NODE_ENV === 'development',
    })
)