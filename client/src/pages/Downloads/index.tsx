import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../Store';
import { DownloadService } from '../../services/download';

const PricingPage: React.FC = () => {

  const { data: Downloads, error, isLoading } = useQuery({
    queryKey: ['downloads'],
    queryFn: () => DownloadService.getDownloads(),
    enabled: useAuthStore.getState().isAuthenticated,
    retry: true,
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Something went wrong</div>

  return (
    <>
      Pricing Plans
        <div>
            {Downloads?.map((download) => (
                <div key={download.download_id}>
                    <button onClick={() => {
                        DownloadService.downloadFile(
                          download.download_id, 
                          download.fileName
                        )
                    }}>
                        { download.download_id }
                    </button>
                </div>
            ))}
        </div>
    </>
  )
}

export default PricingPage