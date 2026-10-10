export enum PasswordActionType {
    CHANGE_PASSWORD = 'CHANGE_PASSWORD',
    RESET_PASSWORD = 'RESET_PASSWORD',
    SET_PASSWORD = 'SET_PASSWORD',
}

/** Machine-readable error codes returned by the password action endpoints. */
export type PasswordActionErrorCode =
    | 'INVALID_PASSWORD'
    | 'INVALID_CURRENT_PASSWORD'
    | 'SAME_PASSWORD'
    | 'NO_PASSWORD_SET'
    | 'ALREADY_HAS_PASSWORD'
    | 'INVALID_SESSION'
    | 'INVALID_TOKEN'
    | 'UNKNOWN';

export type PasswordPolicyErrorCode = 'TOO_SHORT' | 'TOO_LONG';

/** Normalized error shape used throughout the password action UI. Never carries raw backend text. */
export interface PasswordActionApiError {
    status: number;
    code: PasswordActionErrorCode;
    policyErrors?: PasswordPolicyErrorCode[];
}

export interface ExchangeActionResponse {
    type: PasswordActionType;
}

export interface ActionSessionResponse {
    type: PasswordActionType;
    expiresAt: string;
}

export interface CompletePasswordActionInput {
    newPassword: string;
    currentPassword?: string;
}
