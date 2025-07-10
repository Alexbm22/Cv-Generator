import { useCheckAuth } from './hooks/useAuth';
import { useIndexedDBHydrate, useFetchCVs, useSyncToServer } from './hooks/useCVs';
import { useAuthStore, useCVsStore } from './Store';
import { useEffect } from 'react';

import './index.css';
import AppRoutes from './router/AppRoutes';

function App() {

  const { mutate: checkAuth } = useCheckAuth();

  const { 
    mutate: hydrateCVs,
    isSuccess,
    isError 
  } = useIndexedDBHydrate();
  const { mutate: mutateSyncCVs } = useSyncToServer()
  const { mutate: fetchCVs } = useFetchCVs();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  useEffect(()=>{
    checkAuth();
  },[checkAuth])
  
  useEffect(() => {
    if(isAuthenticated) {

      const { lastSynced, isSyncStale } = useCVsStore.getState();
      if (!lastSynced) {
        fetchCVs();
      } else {
        if(isSuccess) {
          if(isSyncStale()){
            mutateSyncCVs()
          } 
        } else if(isError){
          fetchCVs();
        } else {
          hydrateCVs();
        }
      }
    }
  }, [isAuthenticated, isSuccess, isError])

  return (
    <AppRoutes/>
  )
}

export default App
