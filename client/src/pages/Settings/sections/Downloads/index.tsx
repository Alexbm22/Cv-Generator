import React, { useEffect } from 'react'
import { Download, FileText, LoaderCircle } from 'lucide-react';
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
  
  if (isLoading) {
    return <div className="flex min-h-40 items-center justify-center text-sm text-gray-600"><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Loading downloads</div>
  }
  if (error) return <div className="py-10 text-sm text-red-600">Unable to load downloaded versions.</div>


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Downloads</h1>
        <p className="mt-1 text-sm text-gray-500">Your saved CV versions are ready to download or reuse.</p>
      </div>

      <div className="border-b border-gray-200" />

      <section className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Downloaded versions</h2>
            <p className="mt-1 text-sm text-gray-500">PDFs generated from your CVs.</p>
          </div>
          <div className="flex h-11 min-w-11 items-center justify-center rounded-xl bg-blue-50 px-3 text-sm font-semibold text-blue-600" aria-label={`${downloads.length} downloads`}>
            <Download className="mr-2 h-4 w-4" />
            {downloads.length}
          </div>
        </div>

        {downloads.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 px-6 text-center">
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-white text-gray-400 shadow-sm">
              <FileText className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-gray-800">No completed downloads yet</p>
            <p className="mt-1 text-sm text-gray-500">Your generated CV PDFs will appear here.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            {downloads.map((download) => <DownloadCard key={download.id} download={download} />)}
          </div>
        )}
      </section>
    </div>
  )
}

export default Downloads