import { AxiosError } from 'axios';
import { ErrorData, ErrorTypes } from './error_interface';

export interface ApiResponse<T> {
    success: boolean,
    message?: string,
    data?: T,
}

export interface ApiErrorData {
    errors?: ErrorData[],
    message: string,
    errType: ErrorTypes;
}

export interface APIError extends AxiosError<ApiErrorData> {}