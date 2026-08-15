import { MediaFilesAttributes } from "./mediaFiles";

export interface DownloadAttributes {
    id: string;
    fileName: string;
    createdAt: Date,
    downloadPreview: MediaFilesAttributes;
    downloadFile: MediaFilesAttributes;
    downloadPhoto: MediaFilesAttributes;
}



export interface DownloadsStore {
    downloads: DownloadAttributes[];
    setDownloads: (downloads: DownloadAttributes[]) => void;
    deleteDownload: (downloadId: string) => void;
}

export type DownloadPreparation =
    | { kind: 'reuse'; download: DownloadAttributes }
    | { kind: 'pending'; actionId: string; downloadId: string; expiresAt: number }
    | {
        kind: 'prepared';
        actionId: string;
        downloadId: string;
        fileName: string;
        pdf: { putUrl: string; expiresAt: number; requiredContentType: 'application/pdf' };
    };

export type DownloadFailureType = 'pdf_generation' | 's3_upload' | 'completion' | 'unknown';