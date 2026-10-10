import { createHash, randomBytes } from 'node:crypto';

export const generateOpaqueSecret = (): string => randomBytes(32).toString('base64url');

export const hashSecret = (secret: string): string =>
    createHash('sha256').update(secret).digest('hex');