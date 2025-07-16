import { PaymentAttributes } from "./payments";
import { SubscriptionAttributes } from "./subscription";

export interface UserAccount {
    username: string | null;
    email: string | null;
    profilePicture: string | null;
}

export interface UserProfile extends UserAccount {
    subscription: SubscriptionAttributes | null;
    credits: number;
    payments: PaymentAttributes[];
}

export interface UserStoreActions {
    setUserProfile: (userData: UserProfile) => void;
    clearUserProfile: () => void,
    getUserProfile: () => UserProfile;
}

export interface UserStore extends UserProfile, UserStoreActions {}