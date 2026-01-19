import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface LoadingStore {
  isLoading: boolean;
  loadingMessage?: string;
  setLoading: (isLoading: boolean, message?: string) => void;
  clearLoading: () => void;
}

export const useLoadingStore = create<LoadingStore>()(
  devtools<LoadingStore>(
    (set) => ({
      isLoading: false,
      loadingMessage: undefined,

      setLoading: (isLoading: boolean, message?: string) =>
        set({ isLoading, loadingMessage: message }),

      clearLoading: () =>
        set({ isLoading: false, loadingMessage: undefined }),
    }),
    {
      name: 'loading-store',
      enabled: import.meta.env.VITE_NODE_ENV === 'development',
    }
  )
);
