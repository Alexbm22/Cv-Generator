
export interface MediaFilesAttributes {
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
    DOWNLOAD_FILE_PHOTO = 'download_file_photo',
    DOWNLOAD_FILE = 'download_file',
    PROFILE_PHOTO = 'profile_photo'
}

export enum OwnerTypes {
    DOWNLOAD = 'DOWNLOAD',
    CV = 'CV',
    USER = 'USER'
}