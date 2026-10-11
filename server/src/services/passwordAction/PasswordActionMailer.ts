import { config } from '@/config/env';
import { PasswordActionType } from '@/interfaces/passwordAction';
import { User } from '@/models';
import { emailService } from '@/services/email';

export interface PasswordActionMailer {
    sendActionLink(user: User, type: PasswordActionType, link: string): Promise<void>;
    sendCompletionNotice(user: User, type: PasswordActionType): Promise<void>;
    sendGoogleOnlyResetNotice(user: User): Promise<void>;
}

export class DefaultPasswordActionMailer implements PasswordActionMailer {
    async sendActionLink(user: User, type: PasswordActionType, link: string): Promise<void> {
        if (config.NODE_ENV === 'development' && config.PASSWORD_ACTION_LOG_LINKS === 'true') {
            console.log('Password action link:', link);
        }

        await emailService.sendPasswordActionLinkEmail(
            user.get('email'),
            type,
            user.get('username'),
            link
        );
    }

    async sendCompletionNotice(user: User, type: PasswordActionType): Promise<void> {
        await emailService.sendPasswordActionTemplate(user.get('email'), 'completion_notice', {
            user_name: user.get('username'),
            action_type: type,
            message: 'Your password was updated. Ignore this email if it was not you.',
        });
    }

    async sendGoogleOnlyResetNotice(user: User): Promise<void> {
        await emailService.sendPasswordActionTemplate(user.get('email'), 'google_only_reset', {
            user_name: user.get('username'),
            message: 'This account uses Google sign-in. Add a password from Settings > Account Setings.',
        });
    }
}

export const passwordActionMailer: PasswordActionMailer = new DefaultPasswordActionMailer();
