import { AxiosError } from 'axios';
import { ApiErrorData, ErrorTypes } from './error';

export interface ApiErrorObject {
    errors?: ApiErrorData[],
    message: string,
    errType: ErrorTypes;
}

export interface APIError extends AxiosError<ApiErrorObject> {}