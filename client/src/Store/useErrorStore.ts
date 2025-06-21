import { create } from 'zustand';
import { devtools } from "zustand/middleware";
import { ErrorStore } from '../interfaces/error_interface';

export const useErrorStore = create<ErrorStore>()(
    devtools<ErrorStore>((set) => ({
        errors: [],

        addError: (error) => set((state: ErrorStore) => ({ errors: [...state.errors, error] })),
        clearErrors: () => set({ errors: [] }),
        removeError: (index) => set((state: ErrorStore) => ({
            errors: state.errors.filter((_, i) => i !== index)
        })),
    }), { 
        name: 'error-store', // Name of the slice in the Redux DevTools
        enabled: import.meta.env.VITE_NODE_ENV === 'development',
    })
)