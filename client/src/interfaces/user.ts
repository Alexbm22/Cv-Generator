import { PaymentAttributes } from "./payments";
import { SubscriptionAttributes } from "./subscription";
import { GuestCVAttributes, UserCVAttributes } from "./cv";

export interface UserAttributes {
    id: string;
    username: string | null;
    email: string | null;
    profilePicture: string | null;
    needsInitialSync: boolean;
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