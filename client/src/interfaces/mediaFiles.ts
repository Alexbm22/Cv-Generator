
export interface MediaFilesAttributes {
    id: string;
    owner_type: OwnerTypes;
    type: MediaTypes;
    presigned_get_URL: PresignedUrl;
    presigned_put_URL: PresignedUrl;
}

export enum MediaTypes {
    CV_PHOTO = 'cv_photo',
    CV_PREVIEW = 'cv_preview'
}

export interface PresignedUrl {
    url: string;
    expiresAt: number;
}

export enum OwnerTypes {
    CV = 'CV',
    USER = 'USER'
}