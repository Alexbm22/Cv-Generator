import { CVAttributes } from './cv_interface';

export interface UserState {
    userName: string | null;
    userEmail: string | null;
    userId: number | null;
    userProfilePicture: string | null;
    userAuthProvider: 'local' | 'google' | null;
    userisAuthenticated: boolean;
    CVs: CVAttributes[] | null;
}

export interface UserActions {
    setUserName: (userName: string) => void;
    setUserEmail: (userEmail: string) => void;
    setUserId: (userId: number) => void;
    setUserProfilePicture: (userProfilePicture: string) => void;
    setUserAuthProvider: (userAuthProvider: 'local' | 'google') => void;
    setUserisAuthenticated: (userisAuthenticated: boolean) => void;
    setCVs: (CVs: CVAttributes[]) => void;
}

export interface UserStore extends UserState, UserActions {}