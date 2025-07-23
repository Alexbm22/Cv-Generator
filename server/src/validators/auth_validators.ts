import { body } from 'express-validator';

export const registrationRules = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Invalid email address')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/)
        .withMessage('Password must include uppercase, lowercase and number'),
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