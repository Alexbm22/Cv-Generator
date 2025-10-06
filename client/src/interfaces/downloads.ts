import { MediaFilesAttributes } from "./mediaFiles";

export interface DownloadAttributes {
    download_id: string;
    fileName: string;
    createdAt: Date,
    downloadPreview: MediaFilesAttributes;
    downloadFile: MediaFilesAttributes;
}

export interface DownloadValidationResult {
    isDuplicate: boolean;
    existingDownload?: DownloadAttributes;
    hasPermission: boolean;
    validationToken?: string; 
}