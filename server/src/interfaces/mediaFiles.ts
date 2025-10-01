import { Optional } from "sequelize";

export interface MediaFilesAttributes {
    id: number;
    public_id: string,
    owner_id: number;
    owner_type: OwnerTypes;
    obj_key: string;
    file_name: string;
    type: MediaTypes;
    createdAt: Date;
    updatedAt: Date;
}

export interface MediaFilesCreationAttributes extends Optional<MediaFilesAttributes, 
    'id' | 'createdAt' | 'updatedAt' | 'public_id'
> {}

export interface PublicMediaFilesAttributes {
    id: string;
    owner_type: OwnerTypes;
    file_name: string;
    type: MediaTypes;
    expiresAt: number;
    presigned_get_URL: string;
    presigned_put_URL: string;
    presigned_delete_URL: string;
}

export enum MediaTypes {
    CV_PHOTO = 'cv_photo',
    CV_PREVIEW = 'cv_preview',
    DOWNLOAD_FILE_PREVIEW = 'download_file_preview',
    DOWNLOAD_FILE = 'download_file'
}

export enum OwnerTypes {
    DOWNLOAD = 'DOWNLOAD',
    CV = 'CV',
    USER = 'USER'
}