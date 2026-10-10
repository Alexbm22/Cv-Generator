import { passwordActionConfig } from '../config/env';

export type PasswordPolicyError = 'TOO_SHORT' | 'TOO_LONG';

export const validatePasswordPolicy = (password: string): {
    ok: boolean;
    errors: PasswordPolicyError[];
} => {
    const length = Array.from(password).length;
    const errors: PasswordPolicyError[] = [];

    if (length < passwordActionConfig.passwordPolicy.minLength) {
        errors.push('TOO_SHORT');
    }
    if (length > passwordActionConfig.passwordPolicy.maxLength) {
        errors.push('TOO_LONG');
    }

    return { ok: errors.length === 0, errors };
};