import { ServerCVAttributes, PublicCVAttributes } from "./cv";

export interface DownloadAttributes {
    id: number;
    public_id: string;
    user_id: number;
    origin_id: string;
    fileName: string;
    metadata: PublicCVAttributes;
    encryptedMetadata: string;
    createdAt: Date,
    updatedAt: Date
}

export interface PublicDownloadData {
    download_id: string;
    fileName: string;
    createdAt: Date,
}