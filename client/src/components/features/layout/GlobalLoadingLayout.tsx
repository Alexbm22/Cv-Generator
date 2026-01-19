import React from 'react';
import { useLoadingStore } from '../../../Store/useLoadingStore';
import { LoadingLayout } from './LoadingLayout';
import { useAuthStore } from '../../../Store';

export const GlobalLoadingLayout: React.FC = () => {
  const { isLoading, loadingMessage: loadingMsg } = useLoadingStore();
  const { isLoadingAuth } = useAuthStore.getState();

  const loadingMessage = isLoadingAuth ? "Loading Authentication" : loadingMsg;

  if (!isLoading && !isLoadingAuth) {
    return null;
  }

  return <LoadingLayout message={loadingMessage} />;
};
