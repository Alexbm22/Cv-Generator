import { config } from '@/config/env';
import { PasswordActionType } from '@/interfaces/passwordAction';
import { User } from '@/models';
import { emailService } from '@/services/email';
import { AppError } from '@/middleware/error_middleware';
import { ErrorTypes } from '@/interfaces/error';

// Password actions are only offered to registered accounts, which always have an email and username.
const accountContact = (user: User): { email: string; username: string } => {
    const email = user.get('email');
    const username = user.get('username');
    if (!email || !username) {
        throw new AppError('Password action requires a registered account', 409, ErrorTypes.INVALID_OPERATION);
    }
    return { email, username };
};

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

        const { email, username } = accountContact(user);
        await emailService.sendPasswordActionLinkEmail(
            email,
            type,
            username,
            link
        );
    }

    async sendCompletionNotice(user: User, type: PasswordActionType): Promise<void> {
        const { email, username } = accountContact(user);
        await emailService.sendPasswordActionTemplate(email, 'completion_notice', {
            user_name: username,
            action_type: type,
            message: 'Your password was updated. Ignore this email if it was not you.',
        });
    }

    async sendGoogleOnlyResetNotice(user: User): Promise<void> {
        const { email, username } = accountContact(user);
        await emailService.sendPasswordActionTemplate(email, 'google_only_reset', {
            user_name: username,
            message: 'This account uses Google sign-in. Add a password from Settings > Account Setings.',
        });
    }
}

export const passwordActionMailer: PasswordActionMailer = new DefaultPasswordActionMailer();
