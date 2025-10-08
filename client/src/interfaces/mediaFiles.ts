
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
    CV_PREVIEW = 'cv_preview'
}

export enum OwnerTypes {
    CV = 'CV',
    USER = 'USER'
}