import { MediaFilesAttributes } from "./mediaFiles";

export interface DownloadAttributes {
    id: string;
    fileName: string;
    createdAt: Date,
    downloadPreview: MediaFilesAttributes;
    downloadFile: MediaFilesAttributes;
    downloadPhoto: MediaFilesAttributes;
}

export interface DownloadValidationResult {
    isDuplicate: boolean;
    existingDownload?: DownloadAttributes;
    hasPermission: boolean;
    validationToken?: string; 
}

export interface DownloadsStore {
    downloads: DownloadAttributes[];
    setDownloads: (downloads: DownloadAttributes[]) => void;
    deleteDownload: (downloadId: string) => void;
}