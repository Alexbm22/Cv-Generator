import { Optional } from 'sequelize';
import { AuthProvider } from './auth';
import { PublicPaymentData } from './payments';
import { PublicSubscriptionData } from './subscriptions';
import { PublicCVAttributes, PublicCVMetadataAttributes } from './cv';
import { PublicMediaFilesAttributes } from './mediaFiles';
import { MediaFiles, User } from '@/models';

export interface UserAccountData {
    username: string;
    email: string;
    profilePicture?: string | null;
}

export interface UserAccountDetails {
    username: string;
    email: string;
    profilePicture?: string | PublicMediaFilesAttributes | undefined;
    activeCVs: number;
    totalDownloads: number;
    memberSince: string;
    useProfilePictureAsDefault: boolean;
}

export interface ServerUserAttributes {
    id: number;
    public_id: string;
    username: string;
    email: string;
    password: string | null;
    googleId: string | null;
    authProvider: AuthProvider;
    isActive: boolean;
    needsInitialSync: boolean;
    useProfilePictureAsDefault: boolean;
    lastLogin: Date | null;
    tokenVersion: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface UserWithMediaFiles extends User {
    mediaFile?: MediaFiles;
}

export interface PublicUserAttributes {
    id: string;
    username: string;
    email: string;
    profilePicture?: PublicMediaFilesAttributes;
    needsInitialSync: boolean;
    authProvider: AuthProvider;
    useProfilePictureAsDefault: boolean;
}

export interface SyncedDataAttributes {
    cvs: PublicCVMetadataAttributes[];
}

export interface InitialDataSyncAttributes {
    cvs: PublicCVAttributes[];
}

export interface UserCreationAttributes extends Optional<ServerUserAttributes, 
'id' | 'googleId' | 'password' | 'lastLogin' | 'isActive' | 'needsInitialSync' | 'useProfilePictureAsDefault' | 'public_id' | 'tokenVersion'> {}
