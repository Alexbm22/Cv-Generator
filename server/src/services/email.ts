import { Resend } from 'resend';
import { config } from '../config/env';
import {
    emailTemplates,
    ChangePasswordVariables,
    EmailTemplateRegistry,
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
        private readonly templates: EmailTemplateRegistry = emailTemplates,
    ) {}

    async sendChangePasswordEmail(
        to: string,
        firstName: string,
    ): Promise<unknown> {
        const templateId = this.templates.change_password.id;
        if (!templateId) throw new Error('Email template "change_password" is not configured in Resend.');

        const variables: ChangePasswordVariables = {
            company_adress: config.EMAIL_DOMAIN,
            company_name: this.fromName,
            first_name: firstName,
            password_reset_url: new URL('/change-password', config.ORIGIN).toString(),
            support_team_email: this.fromAddress,
        };

        try {
            return await this.provider.sendTemplate({
                from: `${this.fromName} <${this.fromAddress}>`,
                to,
                templateId,
                variables,
                subject: 'Change your password',
            });
        } catch {
            throw new Error('Failed to send the change-password email.');
        }
    }
}

export const emailService = new EmailService();
