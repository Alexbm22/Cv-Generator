import { PaymentAttributes } from "./payments";
import { SubscriptionAttributes } from "./subscription";
import { GuestCVAttributes, UserCVAttributes } from "./cv";
import { MediaFilesAttributes } from "./mediaFiles";
import { AuthProvider } from "./auth";

export interface UserAttributes {
    id: string;
    username: string;
    email: string;
    profilePicture?: MediaFilesAttributes | null;
    needsInitialSync: boolean;
    authProvider: AuthProvider | null;
    useProfilePictureAsDefault: boolean;
}

export interface UserAccountDetails {
    username: string;
    email: string;
    profilePicture?: MediaFilesAttributes | null;
    activeCVs: number;
    totalDownloads: number;
    memberSince: string;
    useProfilePictureAsDefault: boolean;
}

export interface UserProfile {
    subscription: SubscriptionAttributes | null;
    credits: number;
    payments: PaymentAttributes[];
}

export interface SyncedDataAttributes {
    cvs: UserCVAttributes[];
}

export interface InitialDataSyncAttributes {
    cvs: Omit<GuestCVAttributes, 'photo' | 'preview'>[];
}

export interface UserStoreActions {
    setUserProfile: (userData: UserProfile) => void;
    clearUserProfile: () => void,
    getUserProfile: () => UserProfile;
}

export interface UserStore extends UserProfile, UserStoreActions {}