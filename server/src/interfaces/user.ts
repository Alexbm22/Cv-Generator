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

export interface UserProfile {
    subscription: PublicSubscriptionData | null,
    payments: PublicPaymentData[],
    credits: number,
}

export interface ServerUserAttributes {
    id: number;
    public_id: string;
    username: string;
    email: string;
    password: string | null;
    googleId: string | null;
    authProvider: AuthProvider;
    googleProfilePictureURL: string | null;
    isActive: boolean;
    needsInitialSync: boolean;
    lastLogin: Date | null;
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
    profilePicture?: PublicMediaFilesAttributes | string;
    needsInitialSync: boolean;
}

export interface SyncedDataAttributes {
    cvs: PublicCVMetadataAttributes[];
}

export interface InitialDataSyncAttributes {
    cvs: PublicCVAttributes[];
}

export interface UserCreationAttributes extends Optional<ServerUserAttributes, 
'id' | 'googleId' | 'password' | 'lastLogin' | 'isActive' | 'needsInitialSync' | 'public_id' | 'googleProfilePictureURL'> {}
