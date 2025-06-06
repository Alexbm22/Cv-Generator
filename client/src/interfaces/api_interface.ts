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
}
