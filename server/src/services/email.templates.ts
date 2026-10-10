interface PasswordActionLinkVariables extends Record<string, string | number> {
    expiry_time: string;
}

export interface ChangePasswordVariables extends PasswordActionLinkVariables {
    first_name: string;
    password_reset_url: string;
}

export interface SetPasswordVariables extends PasswordActionLinkVariables {
    user_name: string;
    reset_url: string;
}

export interface ResetPasswordVariables extends PasswordActionLinkVariables {
    user_name: string;
    reset_url: string;
}

export interface PasswordActionCompletionVariables extends Record<string, string | number> {
    user_name: string;
    action_type: string;
    message: string;
}

export interface GoogleOnlyResetVariables extends Record<string, string | number> {
    user_name: string;
    message: string;
}

export const passwordActionEmailTemplates = {
    set_password: {
        id: 'set-password',
        subject: 'Set your password',
    },
    change_password: {
        id: 'change-password',
        subject: 'Change your password',
    },
    reset_password: {
        id: 'reset-password',
        subject: 'Reset your password',
    },
    completion_notice: {
        id: 'password-action-complete',
        subject: 'Password updated',
    },
    google_only_reset: {
        id: 'password-action-google-reset',
        subject: 'Your account uses Google sign-in',
    },
} as const;

export type PasswordActionEmailTemplateKey = keyof typeof passwordActionEmailTemplates;
export type PasswordActionEmailVariables = {
    set_password: SetPasswordVariables;
    change_password: ChangePasswordVariables;
    reset_password: ResetPasswordVariables;
    completion_notice: PasswordActionCompletionVariables;
    google_only_reset: GoogleOnlyResetVariables;
};
