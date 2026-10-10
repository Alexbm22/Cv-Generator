import { body } from 'express-validator';
import { validatePasswordPolicy } from '@/utils/passwordPolicy';

export const registrationRules = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Invalid email address')
        .normalizeEmail(),
    body('password')
        .custom((password: unknown) => typeof password === 'string' && validatePasswordPolicy(password).ok)
        .withMessage('Password must be between 10 and 128 characters long'),
    body('username')
        .trim()
        .isLength({ min: 3 })
        .withMessage('First name must be at least 3 characters long')
        .escape(),
]

export const loginRules = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Invalid email address')
        .normalizeEmail(),
    body('password')
        .not()
        .isEmpty()
        .withMessage('Password is required')
]