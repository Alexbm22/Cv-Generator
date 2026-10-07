export interface EmailTemplateDefinition<TVariables extends Record<string, string | number>> {
    readonly id?: string;
    readonly version?: string;
    readonly variables: readonly (keyof TVariables & string)[];
}

export interface PasswordResetVariables extends Record<string, string | number> {
    resetUrl: string;
}

export interface ChangePasswordVariables extends Record<string, string | number> {
    company_adress: string;
    company_name: string;
    first_name: string;
    password_reset_url: string;
    support_team_email: string;
}

export const emailTemplates = {
    change_password: {
        id: 'change-password',
        version: '1.0',
        variables: ['company_adress', 'company_name', 'first_name', 'password_reset_url', 'support_team_email'],
    } satisfies EmailTemplateDefinition<ChangePasswordVariables>,
} as const;

export type EmailTemplateKey = keyof typeof emailTemplates;
export type EmailTemplateVariables = {
    change_password: ChangePasswordVariables;
};

export type EmailTemplateRegistry = {
    [TKey in EmailTemplateKey]: EmailTemplateDefinition<EmailTemplateVariables[TKey]>;
};
