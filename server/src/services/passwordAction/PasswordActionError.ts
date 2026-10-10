import { AppError } from '@/middleware/error_middleware';
import { ErrorTypes } from '@/interfaces/error';

export type PasswordActionErrorCode = 'INVALID_TOKEN' | 'INVALID_SESSION' | 'USER_MISMATCH';

export enum PasswordActionFailureReason {
    NOT_FOUND = 'NOT_FOUND',
    EXPIRED = 'EXPIRED',
    ALREADY_USED = 'ALREADY_USED',
    REVOKED = 'REVOKED',
    COMPLETED = 'COMPLETED',
    TYPE_MISMATCH = 'TYPE_MISMATCH',
    MALFORMED = 'MALFORMED',
    USER_MISMATCH = 'USER_MISMATCH',
    INVALID_STATE = 'INVALID_STATE',
}

export class PasswordActionError extends AppError {
    public readonly code: PasswordActionErrorCode;
    public readonly reason: PasswordActionFailureReason;

    constructor(code: PasswordActionErrorCode, reason: PasswordActionFailureReason) {
        super('Invalid password action.', 400, ErrorTypes.INVALID_TOKEN, { code });
        this.code = code;
        this.reason = reason;
        this.name = 'PasswordActionError';
    }
}