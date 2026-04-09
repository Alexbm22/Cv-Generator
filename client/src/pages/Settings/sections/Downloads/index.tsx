import React, { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../../../Store';
import { DownloadService } from '../../../../services/download';
import DownloadCard from './downloadCard';
import { useDownloadsStore } from '../../../../Store/useDownloadsStore';

const Downloads: React.FC = () => {

  const downloads = useDownloadsStore(state => state.downloads);
  const setDownloads = useDownloadsStore(state => state.setDownloads);

  const { data: Downloads, error, isLoading, isSuccess } = useQuery({
    queryKey: ['downloads'],
    queryFn: () => DownloadService.getDownloads(),
    enabled: useAuthStore.getState().isAuthenticated,
    retry: true,
  })
  
  useEffect(() => {
    if (isSuccess) {
      setDownloads(Downloads);
    }
  }, [isSuccess, Downloads, setDownloads])
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Something went wrong</div>


  return (
    <>
        <div>
            {downloads?.map((download) => (
                <div key={download.id}>
                  <DownloadCard download={download} />
                </div>
            ))}
        </div>
    </>
  )
}

export default Downloads