import { Optional } from "sequelize";
import { ServerCVAttributes, PublicCVAttributes, CVCreationAttributes } from "./cv";
import { Download, MediaFiles } from "@/models";
import { PublicMediaFilesAttributes } from "./mediaFiles";

export interface DownloadAttributes {
    id: number;
    public_id: string;
    user_id: number;
    origin_id: string;
    fileName: string;
    metadata: DownloadMetadataCVAttributes;
    encryptedMetadata: string;
    createdAt: Date,
    updatedAt: Date
}

export interface DownloadCreationAttributes extends Optional<DownloadAttributes, 
    'id' | 'encryptedMetadata' | 'createdAt' | 'updatedAt' | 'public_id'
> {}

export interface DownloadWithMediaFiles extends Download {
  mediaFiles: MediaFiles[];
}

export interface DownloadValidationResult {
    isDuplicate: boolean;
    existingDownload?: PublicDownloadData;
    hasPermission: boolean;
    validationToken?: string; 
}

export interface DownloadMetadataCVAttributes extends Omit<
    ServerCVAttributes, 'id' | 'createdAt' | 'updatedAt' | 'public_id' | 'encryptedContent'
> {}

export interface PublicDownloadData {
    id: string;
    fileName: string;
    createdAt: Date,
    downloadPreview: PublicMediaFilesAttributes;
    downloadFile: PublicMediaFilesAttributes;
    downloadPhoto: PublicMediaFilesAttributes;
}