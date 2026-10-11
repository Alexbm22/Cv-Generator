import { randomUUID } from 'crypto';
import { PasswordActionType } from '@/interfaces/passwordAction';
import { ActionLogService } from '@/services/actionLog';
import { PasswordActionFailureReason } from './PasswordActionError';

export type PasswordActionLogEvent =
    | 'password.forgot.requested'
    | 'password.forgot.failed'
    | 'password.request.issued'
    | 'password.exchange.ok'
    | 'password.exchange.failed'
    | 'password.complete.ok'
    | 'password.complete.failed'
    | 'password.complete.notice_failed';

export type PasswordActionLogReason = PasswordActionFailureReason
    | 'INVALID_PASSWORD'
    | 'INVALID_CURRENT_PASSWORD'
    | 'SAME_PASSWORD'
    | 'ALREADY_HAS_PASSWORD'
    | 'NO_PASSWORD_SET'
    | 'INTERNAL_ERROR';

export interface PasswordActionLogEntry {
    schemaVersion: 1;
    timestamp: string;
    level: 'info' | 'warn' | 'error';
    event: PasswordActionLogEvent;
    actionId: string;
    userId: number | null;
    type: PasswordActionType | null;
    ip: string;
    reason: PasswordActionLogReason | null;
}

export class PasswordActionLogger {
    static async append(input: Omit<PasswordActionLogEntry, 'schemaVersion' | 'timestamp' | 'actionId' | 'level'> & {
        actionId?: string;
    }): Promise<void> {
        const entry: PasswordActionLogEntry = {
            schemaVersion: 1,
            timestamp: new Date().toISOString(),
            level: input.event.endsWith('.failed') ? 'warn' : 'info',
            actionId: input.actionId ?? randomUUID(),
            event: input.event,
            userId: input.userId,
            type: input.type,
            ip: input.ip,
            reason: input.reason,
        };

        try {
            await ActionLogService.appendPasswordAction(entry);
        } catch {}
    }
}
