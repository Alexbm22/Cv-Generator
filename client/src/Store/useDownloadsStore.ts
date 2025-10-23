import { create } from 'zustand';
import { devtools } from "zustand/middleware";
import { DownloadsStore } from '../interfaces/downloads';

export const useDownloadsStore = create<DownloadsStore>()(
    devtools<DownloadsStore>((set) => ({
        downloads: [],
        setDownloads: (downloads) => {
            set({ downloads });
        },
        deleteDownload: (downloadId) => {
            set((state) => ({
                downloads: state.downloads.filter(download => download.id !== downloadId)
            }));
        }
    }), { 
        name: 'downloads-store', // Name of the slice in the Redux DevTools
        enabled: import.meta.env.VITE_NODE_ENV === 'development',
    })
)