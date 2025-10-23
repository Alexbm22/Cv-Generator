import { Optional } from "sequelize";

export interface MediaFilesAttributes {
    id: number;
    public_id: string,
    owner_id: number;
    obj_key: string;
    file_name: string;
    owner_type: OwnerType;
    file_type: FileType;
    type: MediaType;
    createdAt: Date;
    updatedAt: Date;
}

export interface MediaFilesCreationAttributes extends Optional<MediaFilesAttributes, 
    'id' | 'createdAt' | 'updatedAt' | 'public_id'
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

export enum FileType {
    PNG = 'png',
    JPG = 'jpg',
    JPEG = 'jpeg',
    GIF = 'gif',
    WEBP = 'webp',
    SVG = 'svg',
    PDF = 'pdf',
    DOC = 'doc',
    DOCX = 'docx',
    TXT = 'txt',
    JSON = 'json',
    XML = 'xml'
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