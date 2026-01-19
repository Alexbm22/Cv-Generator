import { useCallback } from 'react';
import { useLoadingStore } from '../Store/useLoadingStore';

/**
 * Custom hook for managing loading states with automatic cleanup
 * 
 * @example
 * const { withLoading } = useLoading();
 * 
 * const fetchData = withLoading(
 *   async () => {
 *     const data = await api.getData();
 *     return data;
 *   },
 *   'Loading data...'
 * );
 */
export const useLoading = () => {
  const { setLoading, clearLoading } = useLoadingStore();

  const withLoading = useCallback(
    <T>(
      asyncFn: () => Promise<T>,
      message?: string
    ): Promise<T> => {
      setLoading(true, message);
      
      return asyncFn().finally(() => {
        clearLoading();
      });
    },
    [setLoading, clearLoading]
  );

  return {
    withLoading,
    setLoading,
    clearLoading,
  };
};
