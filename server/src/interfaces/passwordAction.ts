import { Optional } from 'sequelize';
import type { Request } from 'express';
import type User from '@/models/user';
import type PasswordActionSession from '@/models/PasswordActionSession';
import type PasswordActionToken from '@/models/PasswordActionToken';

export enum PasswordActionType {
    CHANGE_PASSWORD = 'CHANGE_PASSWORD',
    RESET_PASSWORD = 'RESET_PASSWORD',
    SET_PASSWORD = 'SET_PASSWORD',
}

export interface PasswordActionContext {
    session: PasswordActionSession;
    token: PasswordActionToken;
    user: User;
}

export interface PasswordActionRequest extends Request {
    passwordAction?: PasswordActionContext;
}

export interface PasswordActionExchangeRequest extends Request {
    authenticatedUserId?: number;
}

export interface PasswordActionTokenAttributes {
    id: number;
    userId: number;
    tokenHash: string;
    type: PasswordActionType;
    expiresAt: Date;
    createdAt: Date;
    /** Set when the token is exchanged for a session. */
    usedAt: Date | null;
    revokedAt: Date | null;
}

export type PasswordActionTokenCreationAttributes = Optional<
    PasswordActionTokenAttributes,
    'id' | 'createdAt' | 'usedAt' | 'revokedAt'
>;

export interface PasswordActionSessionAttributes {
    id: number;
    userId: number;
    passwordActionTokenId: number;
    sessionSecretHash: string;
    expiresAt: Date;
    createdAt: Date;
    /** Set when the password operation succeeds. */
    completedAt: Date | null;
    revokedAt: Date | null;
}

export type PasswordActionSessionCreationAttributes = Optional<
    PasswordActionSessionAttributes,
    'id' | 'createdAt' | 'completedAt' | 'revokedAt'
>;