import { body } from 'express-validator';

export const forgotPasswordRules = [
    body('email').trim().isEmail().normalizeEmail(),
];

export const completePasswordActionRules = [
    body('newPassword').isString(),
    body('currentPassword').optional().isString(),
];
