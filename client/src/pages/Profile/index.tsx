import React, { useEffect } from 'react';
import { useAuthStore, useUserStore } from '../../Store';
import { useQuery } from '@tanstack/react-query';
import { UserServices } from '../../services/user';

const ProfilePage: React.FC = () => {

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setUserProfile = useUserStore(state => state.setUserProfile);
  const clearUserProfile = useUserStore(state => state.clearUserProfile);

  const {
    data: profile,
    isSuccess,
    isError,
  } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => UserServices.fetchUserProfile(),
    enabled: isAuthenticated,
    staleTime: 60000,
  });

  useEffect(() => {
    if (profile && isSuccess) setUserProfile(profile);
    else if (isError) clearUserProfile();
  }, [profile, isSuccess, isError]);

  return (
    <>
      {profile ? profile.credits : 'No Profile Data'}
    </>
  )

}

export default ProfilePage;