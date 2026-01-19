import React from 'react';
import { LoadingSpinner } from '../../UI/LoadingSpinner';

interface LoadingLayoutProps {
  message?: string;
}

export const LoadingLayout: React.FC<LoadingLayoutProps> = ({ message }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 p-8">
        <LoadingSpinner size="lg" />
        {message && (
          <p className="text-lg font-medium text-white">{message}</p>
        )}
      </div>
    </div>
  );
};
