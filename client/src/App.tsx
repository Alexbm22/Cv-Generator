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

  return (
    <AppRoutes/>
  )
}

export default App
