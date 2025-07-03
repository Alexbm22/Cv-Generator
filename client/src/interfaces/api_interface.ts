import { AxiosError } from 'axios';
import { ApiErrorData, ErrorTypes } from './error_interface';

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