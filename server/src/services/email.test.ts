import { EmailProvider, EmailService } from './email';
import { emailTemplates } from './email.templates';

describe('EmailService', () => {
    it('sends the expected template payload', async () => {
        const sendTemplate = jest.fn().mockResolvedValue({ id: 'email-id' });
        const templates = {
            ...emailTemplates,
            PASSWORD_RESET: { ...emailTemplates.PASSWORD_RESET, id: 'reset-template' },
        };
        const service = new EmailService(
            { sendTemplate } as EmailProvider,
            'no-reply@example.com',
            'CV Generator',
            templates,
        );
        await service.sendTemplate('PASSWORD_RESET', 'user@example.com', {
            resetUrl: 'https://example.com/reset',
        });
        expect(sendTemplate).toHaveBeenCalledWith({
            from: 'CV Generator <no-reply@example.com>',
            to: 'user@example.com',
            templateId: 'reset-template',
            variables: { resetUrl: 'https://example.com/reset' },
        });
    });

    it('rejects unconfigured templates and provider failures', async () => {
        const provider: EmailProvider = { sendTemplate: jest.fn() };
        const service = new EmailService(provider);
        await expect(
            service.sendTemplate('WELCOME', 'user@example.com', { userName: 'Alex' }),
        ).rejects.toThrow('not configured in Resend');

        const configured = new EmailService(
            { sendTemplate: jest.fn().mockRejectedValue(new Error('provider')) },
            'no-reply@example.com',
            'CV Generator',
            { ...emailTemplates, WELCOME: { ...emailTemplates.WELCOME, id: 'welcome-template' } },
        );
        await expect(
            configured.sendTemplate('WELCOME', 'user@example.com', { userName: 'Alex' }),
        ).rejects.toThrow('Failed to send email template "WELCOME".');
    });
});
