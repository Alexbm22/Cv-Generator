import { AuthProvider } from './auth_interfaces';

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