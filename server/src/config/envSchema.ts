import fs from 'fs';
import { z } from 'zod';

const MAX_TIMER_MS = 2_147_483_647;
const MAX_RATE_LIMIT = 1_000_000;
const MIN_SECRET_LENGTH = 32;
const PLACEHOLDER_PATTERN = /change[-_ ]?me|placeholder|example|dummy/i;
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]']);

// Strict positive integer capped at max. Omit defaultValue to make the variable required.
const boundedInt = (max: number, defaultValue?: number) => {
    const base = z.string()
        .regex(/^[1-9]\d*$/)
        .transform(Number)
        .pipe(z.number().int().min(1).max(max));
    return defaultValue === undefined ? base : base.default(defaultValue);
};

const isHttpOrigin = (value: string): boolean => {
    try {
        const url = new URL(value);
        return (url.protocol === 'http:' || url.protocol === 'https:')
            && url.pathname === '/' && url.search === '' && url.hash === ''
            && url.username === '' && url.password === '';
    } catch {
        return false;
    }
};

const isLocalOrigin = (url: URL): boolean =>
    LOCAL_HOSTNAMES.has(url.hostname) || url.hostname.endsWith('.localhost');

const isFile = (path: string): boolean =>
    fs.statSync(path, { throwIfNoEntry: false })?.isFile() ?? false;

const secret = (name: string) =>
    z.string().min(MIN_SECRET_LENGTH, { message: `${name} must be at least ${MIN_SECRET_LENGTH} characters` });

export const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']),
    PORT: boundedInt(65535),

    SSL_KEY_PATH: z.string().optional(),
    SSL_CERT_PATH: z.string().optional(),

    ORIGIN: z.string().refine(isHttpOrigin, {
        message: 'ORIGIN must be an http(s) origin such as https://app.example.com (no path, query or credentials)',
    }),

    RATE_LIMIT_DEFAULT_WINDOW_MS: boundedInt(MAX_TIMER_MS),
    RATE_LIMIT_AUTH_WINDOW_MS: boundedInt(MAX_TIMER_MS),
    RATE_LIMIT_DEFAULT_LIMIT: boundedInt(MAX_RATE_LIMIT),
    RATE_LIMIT_AUTH_LIMIT: boundedInt(MAX_RATE_LIMIT),
    RATE_LIMIT_REFRESH_TOKEN_WINDOW_MS: boundedInt(MAX_TIMER_MS),
    RATE_LIMIT_REFRESH_TOKEN_LIMIT: boundedInt(MAX_RATE_LIMIT),
    RATE_LIMIT_CHECK_AUTH_WINDOW_MS: boundedInt(MAX_TIMER_MS),
    RATE_LIMIT_CHECK_AUTH_LIMIT: boundedInt(MAX_RATE_LIMIT),
    RATE_LIMIT_CVS_LIMIT: boundedInt(MAX_RATE_LIMIT),
    RATE_LIMIT_CVS_WINDOW_MS: boundedInt(MAX_TIMER_MS),

    JWT_SECRET: secret('JWT_SECRET'),
    JWT_REFRESH_SECRET: secret('JWT_REFRESH_SECRET'),
    JWT_EXPIRATION: z.string(),
    JWT_REFRESH_EXPIRATION: z.string(),

    DB_HOST: z.string(),
    DB_PORT: boundedInt(65535),
    DB_USER: z.string(),
    DB_PASSWORD: z.string(),
    DB_NAME: z.string(),
    DB_DIALECT: z.enum(['postgres', 'mysql']).default('postgres'),

    ENCRYPTION_KEY: z.string().regex(/^[0-9a-fA-F]{64}$/, {
        message: 'ENCRYPTION_KEY must be 64 hex characters (32 bytes for AES-256)',
    }),

    AWS_S3_BUCKET: z.string(),
    AWS_REGION: z.string(),
    AWS_ACCESS_KEY_ID: z.string(),
    AWS_SECRET_ACCESS_KEY: z.string(),

    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_ID_SALT: z.string(),

    STRIPE_SECRET_KEY: z.string(),
    STRIPE_WEBHOOK_SECRET: z.string(),
    OPENAI_API_KEY: z.string(),
    RESEND_API_KEY: z.string(),
    EMAIL_FROM_ADDRESS: z.string().email(),
    EMAIL_FROM_NAME: z.string(),
    EMAIL_DOMAIN: z.string(),

    // Lifetime of the emailed password-action token (minutes, 1-60).
    PASSWORD_ACTION_TOKEN_TTL_MIN: boundedInt(60, 20),
    // Lifetime of the password-action session cookie (minutes, 1-60).
    PASSWORD_ACTION_SESSION_TTL_MIN: boundedInt(60, 15),
    // Cookie name; RFC 6265 token characters only.
    PASSWORD_ACTION_COOKIE_NAME: z.string()
        .regex(/^[!#$%&'*+\-.^_`|~0-9A-Za-z]{1,64}$/)
        .default('password_action_session'),
    // Cookie path; must start with '/' and avoid control chars, spaces, ';' and ','.
    PASSWORD_ACTION_COOKIE_PATH: z.string()
        .regex(/^\/[^\x00-\x20\x7f;,]{0,255}$/)
        .default('/api/password'),
    PASSWORD_ACTION_LOG_LINKS: z.enum(['true', 'false']).default('false'),

    PASSWORD_ARGON2_MEMORY_COST: boundedInt(1_048_576, 19456),
    PASSWORD_ARGON2_TIME_COST: boundedInt(10, 2),
    PASSWORD_ARGON2_PARALLELISM: boundedInt(64, 1),
    PASSWORD_MIN_LENGTH: boundedInt(4096, 10),
    PASSWORD_MAX_LENGTH: boundedInt(4096, 128),

    // Lifetime of the guest identity cookie (days, 1-365).
    GUEST_COOKIE_MAX_AGE_DAYS: boundedInt(365, 180),
}).superRefine((values, context) => {
    const addIssue = (path: string, message: string) =>
        context.addIssue({ code: 'custom', path: [path], message });

    if (values.PASSWORD_MIN_LENGTH > values.PASSWORD_MAX_LENGTH) {
        addIssue('PASSWORD_MIN_LENGTH', 'PASSWORD_MIN_LENGTH must not exceed PASSWORD_MAX_LENGTH');
    }
    if (values.PASSWORD_ARGON2_MEMORY_COST < 8 * values.PASSWORD_ARGON2_PARALLELISM) {
        addIssue('PASSWORD_ARGON2_MEMORY_COST', 'PASSWORD_ARGON2_MEMORY_COST must be at least 8 times PASSWORD_ARGON2_PARALLELISM');
    }

    if (values.JWT_SECRET && values.JWT_SECRET === values.JWT_REFRESH_SECRET) {
        addIssue('JWT_REFRESH_SECRET', 'JWT_REFRESH_SECRET must differ from JWT_SECRET');
    }

    const keyPath = values.SSL_KEY_PATH || undefined;
    const certPath = values.SSL_CERT_PATH || undefined;
    if (Boolean(keyPath) !== Boolean(certPath)) {
        addIssue('SSL_KEY_PATH', 'SSL_KEY_PATH and SSL_CERT_PATH must be set together');
    }
    if (keyPath && !isFile(keyPath)) {
        addIssue('SSL_KEY_PATH', 'SSL_KEY_PATH must point to an existing file');
    }
    if (certPath && !isFile(certPath)) {
        addIssue('SSL_CERT_PATH', 'SSL_CERT_PATH must point to an existing file');
    }

    if (values.NODE_ENV !== 'production') {
        return;
    }

    if (values.ORIGIN && isHttpOrigin(values.ORIGIN)) {
        const url = new URL(values.ORIGIN);
        if (url.protocol !== 'https:' || isLocalOrigin(url)) {
            addIssue('ORIGIN', 'ORIGIN must use https and must not point to localhost in production');
        }
    }

    if (values.STRIPE_SECRET_KEY && !/^(sk|rk)_live_/.test(values.STRIPE_SECRET_KEY)) {
        addIssue('STRIPE_SECRET_KEY', 'STRIPE_SECRET_KEY must be a live key (sk_live_ or rk_live_) in production; sk_test_ keys are rejected');
    }

    for (const name of ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'GOOGLE_ID_SALT'] as const) {
        const value = values[name];
        if (value && PLACEHOLDER_PATTERN.test(value)) {
            addIssue(name, `${name} looks like a placeholder value`);
        }
    }
});

export type Env = z.infer<typeof envSchema>;

export type EnvValidationResult =
    | { success: true; data: Env }
    | { success: false; errors: string[] };

// Error messages name the variable only; input values are never included.
export const validateEnv = (source: NodeJS.ProcessEnv): EnvValidationResult => {
    const parsed = envSchema.safeParse(source);
    if (parsed.success) {
        return { success: true, data: parsed.data };
    }
    return {
        success: false,
        errors: parsed.error.issues.map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`),
    };
};
