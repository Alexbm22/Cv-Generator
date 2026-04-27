import { body } from 'express-validator';

const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export const updateCustomColorsRules = [
    body('customColors')
        .isArray({ max: 20 })
        .withMessage('customColors must be an array of at most 20 colors'),
    body('customColors.*')
        .isString()
        .matches(HEX_COLOR_REGEX)
        .withMessage('Each color must be a valid hex color (e.g. #fff or #ffffff)'),
];  
