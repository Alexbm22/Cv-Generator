import { AxiosError } from 'axios';
import { ApiErrorData, ErrorTypes } from './error';

export interface ApiResponse<T> {
    success: boolean,
    message?: string,
    data?: T,
}

export interface ApiErrorObject {
    errors?: ApiErrorData[],
    message: string,
    errType: ErrorTypes;
}

export interface APIError extends AxiosError<ApiErrorObject> {}