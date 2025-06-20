import { CVAttributes } from './cv_interface';

export interface UserObj {
    username: string | null;
    email: string | null;
    profilePicture: string | null;
}

export interface UserStoreAttributes extends UserObj {
    CVs: CVAttributes[];
}

export interface UserStoreActions {
    setUserName: (username: string) => void;
    setUserEmail: (email: string) => void;
    setProfilePicture: (profilePicture: string) => void;
    setUserData: (userData: UserObj) => void;
    clearUserData: () => void,

    getUserObj: () => UserObj;
    addCV: (CV: CVAttributes) => void;
    removeCV: (id: string) => void;
    updateCV: (updatedCV: CVAttributes) => void;
}

export interface UserStore extends UserStoreAttributes, UserStoreActions {}