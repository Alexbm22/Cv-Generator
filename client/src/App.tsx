import { useCheckAuth } from './hooks/useAuth';
import { useHydrateCVs, useFetchCVs } from './hooks/useCVs';
import { useAuthStore, useCVsStore } from './Store';
import { useEffect } from 'react';

import './index.css';
import AppRoutes from './router/AppRoutes';

function App() {

  const { mutate: checkAuth, isPending: isPendingAuth } = useCheckAuth();

  const { mutate: hydrateCVs } = useHydrateCVs();
  const { mutate: fetchCVs } = useFetchCVs();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setIsLoadingAuth = useAuthStore((state) => state.setIsLoadingAuth);
  
  useEffect(()=>{
    checkAuth();
    setIsLoadingAuth(isPendingAuth);
  },[checkAuth])
  
  useEffect(() => {
    const { lastSynced } = useCVsStore.getState();

    if(isAuthenticated) {
      if (!lastSynced) {
        fetchCVs();
      } else {
        hydrateCVs();
      }
    }
  }, [isAuthenticated])

  return (
    <AppRoutes/>
  )
}

export default App
