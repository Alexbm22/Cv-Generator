import { useCheckAuth } from './hooks/useAuth';
import { useIndexedDBHydrate, useFetchCVs, useSyncToServer } from './hooks/useCVs';
import { useAuthStore, useCVsStore, useUserStore } from './Store';
import { useEffect } from 'react';
import './index.css';
import AppRoutes from './router/AppRoutes';
import { useQuery } from '@tanstack/react-query';
import { UserServices } from './services/user';

function App() {

  const { mutate: checkAuth } = useCheckAuth();

  const { 
    mutate: hydrateCVs,
    isSuccess: isHydrationSuccess,
    isError: isHydrationError 
  } = useIndexedDBHydrate();
  const { mutate: mutateSyncCVs } = useSyncToServer()
  const { mutate: fetchCVs } = useFetchCVs();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const setUserProfile = useUserStore(state => state.setUserProfile);
  const clearUserProfile = useUserStore(state => state.clearUserProfile);

  const { data: ProfileData, isSuccess, isError } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => UserServices.fetchUserProfile(),
    enabled: isAuthenticated,
    retry: true,
    staleTime: 60 * 1000, // 1 minute
  })

  useEffect(() => {
    if(ProfileData && isSuccess){
      setUserProfile(ProfileData);
    } else if (isError) {
      clearUserProfile();
    }
  }, [ProfileData])
   
  useEffect(()=>{
    if(!isAuthenticated) {
      checkAuth();
    }
  },[checkAuth])
  
  // to do improve the logic
  useEffect(() => {
    if(isAuthenticated) {
      const { lastSynced, isSyncStale } = useCVsStore.getState();
      if (!lastSynced) {
        fetchCVs();
      } else {
        if(isHydrationSuccess) {
          if(isSyncStale()){
            mutateSyncCVs()
          } 
        } else if(isHydrationError){
          fetchCVs();
        } else {
          hydrateCVs();
        }
      }
    }
  }, [isAuthenticated, isHydrationSuccess, isHydrationError])

  return (
    <AppRoutes/>
  )
}

export default App
