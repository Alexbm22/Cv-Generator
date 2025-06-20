import { APIError } from './api_interface';
import { AppError } from '../services/Error/Errors';

export enum ErrorTypes {
    VALIDATION_ERR = "VALIDATION_ERR",
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
    MISSING_TOKEN = "MISSING_TOKEN",
    INVALID_TOKEN = "INVALID_TOKEN",
    ACCOUNT_LOCKED = "ACCOUNT_LOCKED",
    UNAUTHORIZED = "UNAUTHORIZED",
    NOT_FOUND = "NOT_FOUND",
    INTERNAL_ERR = "INTERNAL_ERR"
}

export interface ErrorHandlersMap {
    [statusCode: number]: (error: AppError) => void;
}

export interface ErrorData {
    message: string;
    param: string;
}

interface ErrorObj {
    statusCode: number;
    message: string,
    errors?: ErrorData[]
}

export interface ErrorStoreAttributes {
    errors: ErrorObj[];
}

export interface ErrorStoreActions {
    addError: (error: ErrorObj) => void;
    clearErrors: () => void;
    removeError: (index: number) => void;
    handleAPIError: (error: APIError) => void
}

export interface ErrorStore extends ErrorStoreActions, ErrorStoreAttributes {}