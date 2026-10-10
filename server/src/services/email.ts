import { Resend } from 'resend';
import { config, passwordActionConfig } from '../config/env';
import { PasswordActionType } from '../interfaces/passwordAction';
import {
    passwordActionEmailTemplates,
    PasswordActionEmailTemplateKey,
    PasswordActionEmailVariables,
} from './email.templates';

export interface EmailProvider {
    sendTemplate(input: {
        from: string;
        to: string | string[];
        templateId: string;
        subject: string;
        variables: Record<string, string | number>;
    }): Promise<unknown>;
}

class ResendEmailProvider implements EmailProvider {
    private readonly resend?: Resend;

    constructor(apiKey: string) {
        if (apiKey) this.resend = new Resend(apiKey);
    }

    async sendTemplate(input: Parameters<EmailProvider['sendTemplate']>[0]): Promise<unknown> {
        if (!this.resend) throw new Error('Resend API key is not configured.');
        const { data, error } = await this.resend.emails.send({
            from: input.from,
            to: input.to,
            subject: input.subject,
            template: { id: input.templateId, variables: input.variables },
        });
        if (error) throw error;
        return data;
    }
}

export class EmailService {
    constructor(
        private readonly provider: EmailProvider = new ResendEmailProvider(config.RESEND_API_KEY),
        private readonly fromAddress = config.EMAIL_FROM_ADDRESS,
        private readonly fromName = config.EMAIL_FROM_NAME,
    ) {}

    async sendPasswordActionLinkEmail(
        to: string,
        type: PasswordActionType,
        userName: string,
        link: string,
    ): Promise<unknown> {
        const shared = {
            expiry_time: `${passwordActionConfig.tokenTtlMinutes} minutes`,
        };

        switch (type) {
            case PasswordActionType.CHANGE_PASSWORD:
                return this.sendPasswordActionTemplate(to, 'change_password', {
                    ...shared,
                    first_name: userName,
                    password_reset_url: link,
                });
            case PasswordActionType.SET_PASSWORD:
                return this.sendPasswordActionTemplate(to, 'set_password', {
                    ...shared,
                    user_name: userName,
                    reset_url: link,
                });
            case PasswordActionType.RESET_PASSWORD:
                return this.sendPasswordActionTemplate(to, 'reset_password', {
                    ...shared,
                    user_name: userName,
                    reset_url: link,
                });
        }
    }

    async sendPasswordActionTemplate<TKey extends PasswordActionEmailTemplateKey>(
        to: string,
        templateKey: TKey,
        variables: PasswordActionEmailVariables[TKey],
    ): Promise<unknown> {
        const template = passwordActionEmailTemplates[templateKey];
        try {
            return await this.provider.sendTemplate({
                from: `${this.fromName} <${this.fromAddress}>`,
                to,
                templateId: template.id,
                variables: {
                    ...variables,
                    company_name: this.fromName,
                    company_adress: config.EMAIL_DOMAIN,
                    support_team_email: this.fromAddress,
                },
                subject: template.subject,
            });
        } catch {
            throw new Error('Failed to send a password-action email.');
        }
    }
}

export const emailService = new EmailService();
