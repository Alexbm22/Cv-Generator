import { AuthProvider } from './auth';
import { PaymentAttributes, PublicPaymentData } from './payments';
import { PublicSubscriptionData, SubscriptionAttributes } from './subscriptions';

export interface UserAccountData {
    username: string;
    email: string;
    profilePicture?: string | null;
}

export interface UserProfile extends UserAccountData {
    subscription: PublicSubscriptionData | null,
    credits: number,
    payments: PublicPaymentData[]
}

export interface UserAttributes {
    id: number;
    username: string;
    email: string;
    password: string | null;
    refreshToken: string | null;
    googleId: string | null;
    profilePicture: string | null;
    authProvider: AuthProvider;
    isActive: boolean;
    lastLogin: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}