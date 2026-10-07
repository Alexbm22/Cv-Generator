import { Resend } from 'resend';
import { config } from '../config/env';
import {
    emailTemplates,
    EmailTemplateKey,
    EmailTemplateVariables,
    EmailTemplateRegistry,
} from './email.templates';

export interface EmailProvider {
    sendTemplate(input: {
        from: string;
        to: string | string[];
        templateId: string;
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

    async sendTemplate<TKey extends EmailTemplateKey>(
        template: TKey,
        to: string | string[],
        variables: EmailTemplateVariables[TKey],
    ): Promise<unknown> {
        const templateId = this.templates[template].id;
        if (!templateId) throw new Error(`Email template "${template}" is not configured in Resend.`);
        try {
            return await this.provider.sendTemplate({
                from: `${this.fromName} <${this.fromAddress}>`,
                to,
                templateId,
                variables,
            });
        } catch {
            throw new Error(`Failed to send email template "${template}".`);
        }
    }
}

export const emailService = new EmailService();
