import { AxiosError } from "axios";
import { AppError } from "../services/Errors";

export enum ErrorTypes {
    TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS",
    VALIDATION_ERR = "VALIDATION_ERR",
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
    MISSING_TOKEN = "MISSING_TOKEN",
    INVALID_TOKEN = "INVALID_TOKEN",
    ACCOUNT_LOCKED = "ACCOUNT_LOCKED",
    UNAUTHORIZED = "UNAUTHORIZED",
    NOT_FOUND = "NOT_FOUND",
    INTERNAL_ERR = "INTERNAL_ERR",
    VERSION_CONFLICT = "VERSION_CONFLICT",
    BAD_REQUEST = "BAD_REQUEST",
}

export interface ErrorStoreAttributes {
    errors: AppError[];
}

export interface ApiErrorResponse {
    message: string;
    errType: ErrorTypes;
    field?: FieldError;
}

export interface FieldError {
    param: string;
    formOrigin: string;
}

export interface ApiError extends AxiosError<ApiErrorResponse> {}

export interface ErrorStoreActions {
    addError: (error: AppError) => void;
    clearErrors: () => void;
    removeError: (index: number) => void;
    removeFieldError: (field: FieldError) => void;
    handleValidationError: (error: unknown, formOrigin: string) => void;
}

export interface ErrorStore extends ErrorStoreActions, ErrorStoreAttributes {}

export interface ApiErrorData {
    message: string;
    param: string;
    formOrigin: string;
}