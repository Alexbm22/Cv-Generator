import { Optional } from "sequelize";

export interface MediaFilesAttributes {
    id: number;
    public_id: string,
    user_id: number;
    owner_id: number;
    s3_key: string;
    filename: string;
    owner_type: OwnerType;
    mime_type: MimeType;
    type: MediaType;
    size: number | null;
    is_active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface MediaFilesCreationAttributes extends Optional<MediaFilesAttributes, 
    'id' | 'createdAt' | 'updatedAt' | 'public_id' | 'size'
> {}

export interface PublicMediaFilesAttributes {
    id: string;
    owner_type: OwnerType;
    file_name: string;
    type: MediaType;
    expiresAt: number;
    presigned_get_URL?: string;
    presigned_put_URL?: string;
    presigned_delete_URL?: string;
}

export enum MimeType {
    IMAGE_PNG = 'image/png',
    IMAGE_JPG = 'image/jpg',
    IMAGE_JPEG = 'image/jpeg',
    IMAGE_GIF = 'image/gif',
    APPLICATION_PDF = 'application/pdf',
    APPLICATION_MSWORD = 'application/msword',
    APPLICATION_JSON = 'application/json',
    TEXT_PLAIN = 'text/plain',
    APPLICATION_XML = 'application/xml'
}

export enum MediaType {
    CV_PHOTO = 'cv_photo',
    CV_PREVIEW = 'cv_preview',
    DOWNLOAD_FILE_PREVIEW = 'download_file_preview',
    DOWNLOAD_FILE_PHOTO = 'download_file_photo',
    DOWNLOAD_FILE = 'download_file'
}

export enum OwnerType {
    DOWNLOAD = 'DOWNLOAD',
    CV = 'CV',
    USER = 'USER'
}

export enum PresignedUrlType {
    GET = 'get',
    PUT = 'put',
    DELETE = 'delete'
}