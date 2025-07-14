import { create } from 'zustand';
import { devtools } from "zustand/middleware";
import { ErrorStore, ErrorTypes, FieldError } from '../interfaces/error';
import * as yup from'yup'
import { AppError } from "../services/Errors"

export const useErrorStore = create<ErrorStore>()(
    devtools<ErrorStore>((set, get) => ({
        errors: [],

        addError: (error) => set((state: ErrorStore) => ({ errors: [...state.errors, error] })),
        clearErrors: () => set({ errors: [] }),
        removeError: (index) => set((state: ErrorStore) => ({
            errors: state.errors.filter((_, i) => i !== index)
        })),

        creeateError: (error: any) => {
            const err = new AppError(
                error.response?.data.message || "Something went wrong!dfsfsdfsd",
                error.response?.status || 500,
                error.response?.data.errType || ErrorTypes.INTERNAL_ERR
            )
            get().addError(err);
        },

        removeFieldError: (field: FieldError) => {
            set((state) => ({
                errors: state.errors.filter((error) => 
                    error.field?.formOrigin !== field.formOrigin ||
                    error.field?.param !== field.param
                )
            }))
        },

        handleValidationError: (error, formOrigin) => {
            if (error instanceof yup.ValidationError) {
                const { addError } = useErrorStore.getState();

                // Extract unique field errors (first error per field)
                const fieldErrors = error.inner.reduce<AppError[]>((acc, validationError) => {
                    if (!acc.some(err => err.field?.param === validationError.path)) {
                        acc.push(AppError.validation(
                            validationError.message, 
                            validationError.path!,
                            formOrigin 
                        ));
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