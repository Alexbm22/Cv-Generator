import sequelize from '@/config/DB/database_config';
import { config } from '@/config/env';
import { PasswordActionContext, PasswordActionType } from '@/interfaces/passwordAction';
import { ErrorTypes } from '@/interfaces/error';
import { User } from '@/models';
import { AppError } from '@/middleware/error_middleware';
import { PasswordActionSession, PasswordActionToken } from '@/models';
import { PasswordActionMailer, passwordActionMailer } from './PasswordActionMailer';
import { PasswordActionLogger } from './PasswordActionLogger';
import { PasswordActionError, PasswordActionFailureReason } from './PasswordActionError';
import { PasswordActionSessionService } from './PasswordActionSessionService';
import { PasswordActionTokenService } from './PasswordActionTokenService';
import { PasswordHasher } from '@/utils/passwordHasher';
import { validatePasswordPolicy } from '@/utils/passwordPolicy';

export interface CompletePasswordActionInput {
    newPassword: string;
    currentPassword?: string;
}

export class PasswordActionService {
    constructor(private readonly mailer: PasswordActionMailer = passwordActionMailer) {}

    async requestAction(type: PasswordActionType, user: User, ip = ''): Promise<void> {
        const hasPassword = user.get('password') !== null;
        const userId = user.get('id');

        if (!user.get('isActive')) {
            throw new AppError('This account is inactive.', 403, ErrorTypes.ACCOUNT_LOCKED);
        }
        if (type === PasswordActionType.CHANGE_PASSWORD && !hasPassword) {
            throw new AppError('A password is not set for this account.', 409, ErrorTypes.INVALID_OPERATION, {
                code: 'NO_PASSWORD_SET',
            });
        }
        if (type === PasswordActionType.SET_PASSWORD && hasPassword) {
            throw new AppError('This account already has a password.', 409, ErrorTypes.INVALID_OPERATION, {
                code: 'ALREADY_HAS_PASSWORD',
            });
        }

        const issued = await PasswordActionTokenService.issue(userId, type);
        await PasswordActionLogger.append({
            event: 'password.request.issued',
            userId,
            type,
            ip,
            reason: null,
        });
        const actionUrl = new URL('/password/action', config.ORIGIN);
        actionUrl.hash = `token=${issued.secret}`;
        await this.mailer.sendActionLink(user, type, actionUrl.toString());
    }

    async requestReset(email: string, ip: string): Promise<void> {
        let userId: number | null = null;
        try {
            const normalizedEmail = email.trim().toLowerCase();
            const user = await User.findOne({ where: { email: normalizedEmail } });
            if (!user) {
                await PasswordActionLogger.append({
                    event: 'password.forgot.requested',
                    userId: null,
                    type: PasswordActionType.RESET_PASSWORD,
                    ip,
                    reason: null,
                });
                return;
            }
            userId = user.get('id');
            await PasswordActionLogger.append({
                event: 'password.forgot.requested',
                userId,
                type: PasswordActionType.RESET_PASSWORD,
                ip,
                reason: null,
            });

            if (!user.get('isActive')) {
                await PasswordActionLogger.append({
                    event: 'password.forgot.failed',
                    userId,
                    type: PasswordActionType.RESET_PASSWORD,
                    ip,
                    reason: PasswordActionFailureReason.ACCOUNT_INACTIVE,
                });
                return;
            }

            if (user.get('password') === null) {
                await this.mailer.sendGoogleOnlyResetNotice(user);
                return;
            }

            const issued = await PasswordActionTokenService.issue(userId, PasswordActionType.RESET_PASSWORD);
            await PasswordActionLogger.append({
                event: 'password.request.issued',
                userId,
                type: PasswordActionType.RESET_PASSWORD,
                ip,
                reason: null,
            });
            const actionUrl = new URL('/password/action', config.ORIGIN);
            actionUrl.hash = `token=${issued.secret}`;
            await this.mailer.sendActionLink(user, PasswordActionType.RESET_PASSWORD, actionUrl.toString());
        } catch {
            await PasswordActionLogger.append({
                event: 'password.forgot.failed',
                userId,
                type: PasswordActionType.RESET_PASSWORD,
                ip,
                reason: 'INTERNAL_ERROR',
            });
        }
    }

    async complete(
        context: PasswordActionContext,
        input: CompletePasswordActionInput,
        ip: string,
    ): Promise<void> {
        const result = await sequelize.transaction(async transaction => {
            const contextSession = context.session.get();

            const session = await PasswordActionSession.findByPk(contextSession.id, {
                transaction,
                lock: transaction.LOCK.UPDATE,
            });
            if (!session || session.get('userId') !== contextSession.userId
                || session.get('passwordActionTokenId') !== contextSession.passwordActionTokenId) {
                throw new PasswordActionError('INVALID_SESSION', PasswordActionFailureReason.NOT_FOUND);
            }
            if (session.get('completedAt') !== null) {
                throw new PasswordActionError('INVALID_SESSION', PasswordActionFailureReason.COMPLETED);
            }
            if (session.get('revokedAt') !== null) {
                throw new PasswordActionError('INVALID_SESSION', PasswordActionFailureReason.REVOKED);
            }
            const now = new Date();
            if (session.get('expiresAt').getTime() <= now.getTime()) {
                throw new PasswordActionError('INVALID_SESSION', PasswordActionFailureReason.EXPIRED);
            }

            const token = await PasswordActionToken.findByPk(session.get('passwordActionTokenId'), {
                transaction,
                lock: transaction.LOCK.UPDATE,
            });
            if (!token || token.get('userId') !== session.get('userId')) {
                throw new PasswordActionError('INVALID_SESSION', PasswordActionFailureReason.NOT_FOUND);
            }
            if (token.get('revokedAt') !== null) {
                throw new PasswordActionError('INVALID_SESSION', PasswordActionFailureReason.REVOKED);
            }

            const user = await User.findByPk(session.get('userId'), {
                transaction,
                lock: transaction.LOCK.UPDATE,
            });
            if (!user) {
                throw new PasswordActionError('INVALID_SESSION', PasswordActionFailureReason.NOT_FOUND);
            }
            if (!user.get('isActive')) {
                throw new PasswordActionError('INVALID_SESSION', PasswordActionFailureReason.ACCOUNT_INACTIVE);
            }

            const policy = validatePasswordPolicy(input.newPassword);
            if (!policy.ok) {
                throw new AppError('Password does not meet the password policy.', 400, ErrorTypes.VALIDATION_ERR, {
                    code: 'INVALID_PASSWORD',
                    errors: policy.errors,
                });
            }

            const type = token.get('type');
            const currentHash = user.get('password');
            if (type === PasswordActionType.CHANGE_PASSWORD) {
                if (currentHash === null) {
                    throw new AppError('A password is not set for this account.', 409, ErrorTypes.INVALID_OPERATION, {
                        code: 'NO_PASSWORD_SET',
                    });
                }
                if (!input.currentPassword || !await user.comparePasswords(input.currentPassword)) {
                    throw new AppError('Current password is invalid.', 400, ErrorTypes.INVALID_CREDENTIALS, {
                        code: 'INVALID_CURRENT_PASSWORD',
                    });
                }
                if (await user.comparePasswords(input.newPassword)) {
                    throw new AppError('The new password must differ from the current password.', 400, ErrorTypes.BAD_REQUEST, {
                        code: 'SAME_PASSWORD',
                    });
                }
            }
            if (type === PasswordActionType.SET_PASSWORD && currentHash !== null) {
                throw new AppError('This account already has a password.', 409, ErrorTypes.INVALID_OPERATION, {
                    code: 'ALREADY_HAS_PASSWORD',
                });
            }

            const password = await PasswordHasher.hash(input.newPassword);
            const updates: { password: string; passwordChangedAt: Date; tokenVersion?: number } = {
                password,
                passwordChangedAt: now,
            };
            if (type !== PasswordActionType.SET_PASSWORD) {
                updates.tokenVersion = user.get('tokenVersion') + 1;
            }
            const [affectedCount] = await User.update(updates, {
                where: { id: user.get('id') },
                transaction,
            });
            if (affectedCount !== 1) {
                throw new PasswordActionError('INVALID_SESSION', PasswordActionFailureReason.INVALID_STATE);
            }

            await PasswordActionSessionService.complete(session.get('id'), { transaction });
            await PasswordActionTokenService.revokeAllForUser(user.get('id'), {
                transaction,
                exceptSessionId: session.get('id'),
            });
            return { user, type };
        });

        try {
            await this.mailer.sendCompletionNotice(result.user, result.type);
        } catch {
            await PasswordActionLogger.append({
                event: 'password.complete.notice_failed',
                userId: result.user.get('id'),
                type: result.type,
                ip,
                reason: 'INTERNAL_ERROR',
            });
        }
        await PasswordActionLogger.append({
            event: 'password.complete.ok',
            userId: result.user.get('id'),
            type: result.type,
            ip,
            reason: null,
        });
    }
}
