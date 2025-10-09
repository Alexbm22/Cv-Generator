import { Optional } from 'sequelize';
import { AuthProvider } from './auth';
import { PublicPaymentData } from './payments';
import { PublicSubscriptionData } from './subscriptions';

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
    lastLogin: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface PublicUserAttributes {
    id: string;
    username: string;
    email: string;
    profilePicture: string | null;
}

export interface UserCreationAttributes extends Optional<ServerUserAttributes, 
'id' | 'googleId' | 'password' | 'profilePicture' | 'lastLogin' | 'isActive' | 'public_id'> {}
