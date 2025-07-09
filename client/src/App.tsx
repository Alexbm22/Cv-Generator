import { useCheckAuth } from './hooks/useAuth';
import { useIndexedDBHydrate, useFetchCVs, useSyncToServer } from './hooks/useCVs';
import { useAuthStore, useCVsStore } from './Store';
import { useEffect } from 'react';

import './index.css';
import AppRoutes from './router/AppRoutes';

function App() {

  const { mutate: checkAuth, isPending: isPendingAuth } = useCheckAuth();

  const { 
    mutate: hydrateCVs,
    isSuccess,
    isError 
  } = useIndexedDBHydrate();
  const { mutate: mutateSyncCVs } = useSyncToServer()
  const { mutate: fetchCVs } = useFetchCVs();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setIsLoadingAuth = useAuthStore((state) => state.setIsLoadingAuth);
  
  useEffect(()=>{
    checkAuth();
    setIsLoadingAuth(isPendingAuth);
  },[checkAuth])
  
  useEffect(() => {
    if(isAuthenticated) {

      const { lastSynced, isSyncStale } = useCVsStore.getState();
      if (!lastSynced) {
        fetchCVs();
      } else {
        if(isSuccess) {
          if(isSyncStale()){

            console.log(isSyncStale())
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
