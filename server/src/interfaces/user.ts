import { Optional } from 'sequelize';
import { AuthProvider } from './auth';
import { PublicPaymentData } from './payments';
import { PublicSubscriptionData } from './subscriptions';
import { PublicCVAttributes, PublicCVMetadataAttributes } from './cv';

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
    profilePicture: string | null;
    authProvider: AuthProvider;
    isActive: boolean;
    needsInitialSync: boolean;
    lastLogin: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface PublicUserAttributes {
    id: string;
    username: string;
    email: string;
    profilePicture: string | null;
    needsInitialSync: boolean;
}

export interface SyncedDataAttributes {
    cvs: PublicCVMetadataAttributes[];
}

export interface InitialDataSyncAttributes {
    cvs: PublicCVAttributes[];
}

export interface UserCreationAttributes extends Optional<ServerUserAttributes, 
'id' | 'googleId' | 'password' | 'profilePicture' | 'lastLogin' | 'isActive' | 'needsInitialSync' | 'public_id'> {}
