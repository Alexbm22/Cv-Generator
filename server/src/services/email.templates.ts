export interface EmailTemplateDefinition<TVariables extends Record<string, string | number>> {
    readonly id?: string;
    readonly version?: string;
    readonly variables: readonly (keyof TVariables & string)[];
}

export interface PasswordResetVariables extends Record<string, string | number> {
    resetUrl: string;
}

export interface WelcomeVariables extends Record<string, string | number> {
    userName: string;
}

export const emailTemplates = {
    PASSWORD_RESET: {
        variables: ['resetUrl'],
    } satisfies EmailTemplateDefinition<PasswordResetVariables>,
    WELCOME: {
        variables: ['userName'],
    } satisfies EmailTemplateDefinition<WelcomeVariables>,
} as const;

export type EmailTemplateKey = keyof typeof emailTemplates;
export type EmailTemplateVariables = {
    PASSWORD_RESET: PasswordResetVariables;
    WELCOME: WelcomeVariables;
};

export type EmailTemplateRegistry = {
    [TKey in EmailTemplateKey]: EmailTemplateDefinition<EmailTemplateVariables[TKey]>;
};
