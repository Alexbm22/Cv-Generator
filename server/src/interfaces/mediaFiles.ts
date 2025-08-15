export interface MediaFilesAttributes {
    id: number;
    public_id: string,
    owner_id: number;
    owner_type: OwnerTypes;
    obj_key: string;
    type: MediaTypes;
    createdAt: Date;
    updatedAt: Date;
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