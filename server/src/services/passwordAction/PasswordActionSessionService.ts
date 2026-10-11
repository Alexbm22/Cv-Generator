import { Op, Transaction } from 'sequelize';
import { passwordActionConfig } from '@/config/env';
import sequelize from '@/config/DB/database_config';
import { PasswordActionSession, PasswordActionToken } from '@/models';
import { PasswordActionType } from '@/interfaces/passwordAction';
import { generateOpaqueSecret, hashSecret } from '@/utils/secrets';
import { PasswordActionError, PasswordActionFailureReason } from './PasswordActionError';

type TransactionOptions = { transaction?: Transaction };

type SessionValidationOptions = TransactionOptions & {
    lock?: boolean;
    expectedType?: PasswordActionType;
};

type SessionValidationResult = {
    sessionId: number;
    tokenId: number;
    userId: number;
    type: PasswordActionType;
    expiresAt: Date;
};

const isOpaqueSecret = (secret: unknown): secret is string =>
    typeof secret === 'string' && /^[A-Za-z0-9_-]{43}$/.test(secret);

export class PasswordActionSessionService {
    static async createForToken(
        token: PasswordActionToken,
        opts: TransactionOptions = {}
    ): Promise<{ sessionSecret: string; sessionId: number; expiresAt: Date }> {
        const now = new Date();
        const secret = generateOpaqueSecret();
        const expiresAt = new Date(Math.min(
            now.getTime() + passwordActionConfig.sessionTtlMinutes * 60_000,
            token.get('expiresAt').getTime()
        ));
        const session = await PasswordActionSession.create({
            userId: token.get('userId'),
            passwordActionTokenId: token.get('id'),
            sessionSecretHash: hashSecret(secret),
            expiresAt,
        }, { transaction: opts.transaction });

        return { sessionSecret: secret, sessionId: session.get('id'), expiresAt };
    }

    static async validate(
        secret: unknown,
        opts: SessionValidationOptions = {}
    ): Promise<SessionValidationResult> {
        if (!isOpaqueSecret(secret)) {
            throw new PasswordActionError('INVALID_SESSION', PasswordActionFailureReason.MALFORMED);
        }
        if (opts.lock && !opts.transaction) {
            throw new Error('A transaction is required to lock a password action session.');
        }

        const session = await PasswordActionSession.findOne({
            where: { sessionSecretHash: hashSecret(secret) },
            transaction: opts.transaction,
            lock: opts.lock && opts.transaction ? opts.transaction.LOCK.UPDATE : undefined,
        });
        if (!session) {
            throw new PasswordActionError('INVALID_SESSION', PasswordActionFailureReason.NOT_FOUND);
        }

        const token = await PasswordActionToken.findByPk(session.get('passwordActionTokenId'), {
            transaction: opts.transaction,
        });
        if (!token) {
            throw new PasswordActionError('INVALID_SESSION', PasswordActionFailureReason.NOT_FOUND);
        }

        const now = new Date();
        if (session.get('completedAt') !== null) {
            throw new PasswordActionError('INVALID_SESSION', PasswordActionFailureReason.COMPLETED);
        }
        if (session.get('revokedAt') !== null || token.get('revokedAt') !== null) {
            throw new PasswordActionError('INVALID_SESSION', PasswordActionFailureReason.REVOKED);
        }
        if (session.get('expiresAt').getTime() <= now.getTime()) {
            throw new PasswordActionError('INVALID_SESSION', PasswordActionFailureReason.EXPIRED);
        }
        if (opts.expectedType !== undefined && opts.expectedType !== token.get('type')) {
            throw new PasswordActionError('INVALID_SESSION', PasswordActionFailureReason.TYPE_MISMATCH);
        }

        return {
            sessionId: session.get('id'),
            tokenId: token.get('id'),
            userId: session.get('userId'),
            type: token.get('type'),
            expiresAt: session.get('expiresAt'),
        };
    }

    static async complete(sessionId: number, opts: TransactionOptions = {}): Promise<void> {
        const now = new Date();
        const [affectedCount] = await PasswordActionSession.update({ completedAt: now }, {
            where: {
                id: sessionId,
                completedAt: null,
                revokedAt: null,
                expiresAt: { [Op.gt]: now },
            },
            transaction: opts.transaction,
        });
        if (affectedCount === 0) {
            const session = await PasswordActionSession.findByPk(sessionId, {
                attributes: ['completedAt', 'revokedAt', 'expiresAt'],
                transaction: opts.transaction,
            });
            const reason = !session
                ? PasswordActionFailureReason.NOT_FOUND
                : session.get('completedAt') !== null
                    ? PasswordActionFailureReason.COMPLETED
                    : session.get('revokedAt') !== null
                        ? PasswordActionFailureReason.REVOKED
                        : session.get('expiresAt').getTime() <= now.getTime()
                            ? PasswordActionFailureReason.EXPIRED
                            : PasswordActionFailureReason.INVALID_STATE;
            throw new PasswordActionError('INVALID_SESSION', reason);
        }
    }

    static async revoke(sessionId: number, opts: TransactionOptions = {}): Promise<void> {
        const now = new Date();
        await PasswordActionSession.update({ revokedAt: now }, {
            where: { id: sessionId, revokedAt: null, completedAt: null },
            transaction: opts.transaction,
        });
    }
}