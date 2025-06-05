export interface ApiResponse<T> {
    success: boolean,
    message?: string,
    data?: T,
    errors?: string[]
}

export interface ApiUserData { 
    username: string;
    email: string;
    profilePicture?: string | null;
    authProvider: 'local' | 'google';
    isActive: boolean;
}

export interface TokenClientData {
    accessToken: string;
    expiresIn: Date;
}