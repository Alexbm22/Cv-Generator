import { Op, Transaction } from 'sequelize';
import sequelize from '@/config/DB/database_config';
import { passwordActionConfig } from '@/config/env';
import { PasswordActionSession, PasswordActionToken, User } from '@/models';
import { PasswordActionType } from '@/interfaces/passwordAction';
import { generateOpaqueSecret, hashSecret } from '@/utils/secrets';
import { PasswordActionError, PasswordActionFailureReason } from './PasswordActionError';
import { PasswordActionSessionService } from './PasswordActionSessionService';

type TransactionOptions = { transaction?: Transaction };
type TransactionCallback<T> = (transaction: Transaction) => Promise<T>;

type RevokeOptions = TransactionOptions & { exceptSessionId?: number };
type ExchangeOptions = TransactionOptions & { authenticatedUserId?: number };

const isOpaqueSecret = (secret: unknown): secret is string =>
    typeof secret === 'string' && /^[A-Za-z0-9_-]{43}$/.test(secret);

const runInTransaction = <T>(
    transaction: Transaction | undefined,
    callback: TransactionCallback<T>
): Promise<T> => transaction
    ? callback(transaction)
    : sequelize.transaction(callback);

export class PasswordActionTokenService {
    private static async revokeAllForUserAt(
        userId: number,
        now: Date,
        opts: RevokeOptions & { transaction: Transaction }
    ): Promise<void> {
        await PasswordActionToken.update({ revokedAt: now }, {
            where: { userId, usedAt: null, revokedAt: null },
            transaction: opts.transaction,
        });

        await PasswordActionSession.update({ revokedAt: now }, {
            where: {
                userId,
                revokedAt: null,
                completedAt: null,
                ...(opts.exceptSessionId === undefined
                    ? {}
                    : { id: { [Op.ne]: opts.exceptSessionId } }),
            },
            transaction: opts.transaction,
        });
    }

    static async issue(
        userId: number,
        type: PasswordActionType,
        opts: TransactionOptions = {}
    ): Promise<{ secret: string; tokenId: number; type: PasswordActionType; expiresAt: Date }> {
        return runInTransaction(opts.transaction, async transaction => {
            const now = new Date();
            await this.revokeAllForUserAt(userId, now, { ...opts, transaction });

            const secret = generateOpaqueSecret();
            const expiresAt = new Date(now.getTime() + passwordActionConfig.tokenTtlMinutes * 60_000);
            const token = await PasswordActionToken.create({
                userId,
                tokenHash: hashSecret(secret),
                type,
                expiresAt,
            }, { transaction });

            return { secret, tokenId: token.id, type, expiresAt };
        });
    }

    static async exchange(
        secret: unknown,
        opts: ExchangeOptions = {}
    ): Promise<{
        sessionSecret: string;
        sessionId: number;
        userId: number;
        type: PasswordActionType;
        expiresAt: Date;
    }> {
        if (!isOpaqueSecret(secret)) {
            throw new PasswordActionError('INVALID_TOKEN', PasswordActionFailureReason.MALFORMED);
        }

        return runInTransaction(opts.transaction, async transaction => {
            const now = new Date();
            const tokenHash = hashSecret(secret);
            const [affectedCount] = await PasswordActionToken.update({ usedAt: now }, {
                where: {
                    tokenHash,
                    usedAt: null,
                    revokedAt: null,
                    expiresAt: { [Op.gt]: now },
                },
                transaction,
            });

            if (affectedCount === 0) {
                const token = await PasswordActionToken.findOne({
                    where: { tokenHash },
                    transaction,
                });
                const reason = !token
                    ? PasswordActionFailureReason.NOT_FOUND
                    : token.get('revokedAt') !== null
                        ? PasswordActionFailureReason.REVOKED
                        : token.get('usedAt') !== null
                            ? PasswordActionFailureReason.ALREADY_USED
                            : PasswordActionFailureReason.EXPIRED;
                throw new PasswordActionError('INVALID_TOKEN', reason);
            }

            const token = await PasswordActionToken.findOne({
                where: { tokenHash },
                transaction,
            });
            if (!token) {
                throw new PasswordActionError('INVALID_TOKEN', PasswordActionFailureReason.NOT_FOUND);
            }
            if (opts.authenticatedUserId !== undefined && opts.authenticatedUserId !== token.get('userId')) {
                throw new PasswordActionError('USER_MISMATCH', PasswordActionFailureReason.USER_MISMATCH);
            }

            const user = await User.findByPk(token.get('userId'), { transaction });
            if (!user || !user.get('isActive')) {
                throw new PasswordActionError('INVALID_TOKEN', user
                    ? PasswordActionFailureReason.ACCOUNT_INACTIVE
                    : PasswordActionFailureReason.NOT_FOUND);
            }

            const session = await PasswordActionSessionService.createForToken(token, { transaction });
            return {
                sessionSecret: session.sessionSecret,
                sessionId: session.sessionId,
                userId: token.get('userId'),
                type: token.get('type'),
                expiresAt: session.expiresAt,
            };
        });
    }

    static async revokeAllForUser(userId: number, opts: RevokeOptions = {}): Promise<void> {
        return runInTransaction(opts.transaction, async transaction => {
            await this.revokeAllForUserAt(userId, new Date(), { ...opts, transaction });
        });
    }
}