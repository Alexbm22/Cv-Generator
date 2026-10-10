import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

// Strict positive integer: rejects empty, decimal, signed, zero and leading-zero input; unset uses the default.
const boundedInt = (max: number, defaultValue: number) =>
    z.string()
        .regex(/^[1-9]\d*$/)
        .transform(Number)
        .pipe(z.number().int().min(1).max(max))
        .default(defaultValue);

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']),
    PORT: z.string().regex(/^\d+$/).transform(Number),

    SSL_KEY_PATH: z.string(),
    SSL_CERT_PATH: z.string(),

    ORIGIN: z.string(),

    RATE_LIMIT_DEFAULT_WINDOW_MS: z.string().regex(/^\d+$/).transform(Number),
    RATE_LIMIT_AUTH_WINDOW_MS: z.string().regex(/^\d+$/).transform(Number),
    RATE_LIMIT_DEFAULT_LIMIT: z.string().regex(/^\d+$/).transform(Number),
    RATE_LIMIT_AUTH_LIMIT: z.string().regex(/^\d+$/).transform(Number),
    RATE_LIMIT_REFRESH_TOKEN_WINDOW_MS: z.string().regex(/^\d+$/).transform(Number),
    RATE_LIMIT_REFRESH_TOKEN_LIMIT: z.string().regex(/^\d+$/).transform(Number),
    RATE_LIMIT_CHECK_AUTH_WINDOW_MS: z.string().regex(/^\d+$/).transform(Number),
    RATE_LIMIT_CHECK_AUTH_LIMIT: z.string().regex(/^\d+$/).transform(Number),
    RATE_LIMIT_CVS_LIMIT: z.string().regex(/^\d+$/).transform(Number),
    RATE_LIMIT_CVS_WINDOW_MS: z.string().regex(/^\d+$/).transform(Number),

    JWT_SECRET: z.string(),
    JWT_REFRESH_SECRET: z.string(),
    JWT_EXPIRATION: z.string(),
    JWT_REFRESH_EXPIRATION: z.string(),

    DB_HOST: z.string(),
    DB_PORT: z.string().regex(/^\d+$/).transform(Number),
    DB_USER: z.string(),
    DB_PASSWORD: z.string(),
    DB_NAME: z.string(),

    ENCRYPTION_KEY: z.string(),

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
}).superRefine((values, context) => {
    if (values.PASSWORD_MIN_LENGTH > values.PASSWORD_MAX_LENGTH) {
        context.addIssue({
            code: 'custom',
            path: ['PASSWORD_MIN_LENGTH'],
            message: 'PASSWORD_MIN_LENGTH must not exceed PASSWORD_MAX_LENGTH',
        });
    }
    if (values.PASSWORD_ARGON2_MEMORY_COST < 8 * values.PASSWORD_ARGON2_PARALLELISM) {
        context.addIssue({
            code: 'custom',
            path: ['PASSWORD_ARGON2_MEMORY_COST'],
            message: 'PASSWORD_ARGON2_MEMORY_COST must be at least 8 times PASSWORD_ARGON2_PARALLELISM',
        });
    }
});

const parsed = envSchema.safeParse(process.env);
if(!parsed.success) {
    console.error("Invalid environment variables:", parsed.error);
    process.exit(1);
}

export type Env = z.infer<typeof envSchema>;
export const config = parsed.data;

export type PasswordActionConfig = Readonly<{
    tokenTtlMinutes: number;
    sessionTtlMinutes: number;
    cookieName: string;
    cookiePath: string;
    argon2: Readonly<{
        memoryCost: number;
        timeCost: number;
        parallelism: number;
    }>;
    passwordPolicy: Readonly<{
        minLength: number;
        maxLength: number;
    }>;
}>;

export const passwordActionConfig: PasswordActionConfig = Object.freeze({
    tokenTtlMinutes: config.PASSWORD_ACTION_TOKEN_TTL_MIN,
    sessionTtlMinutes: config.PASSWORD_ACTION_SESSION_TTL_MIN,
    cookieName: config.PASSWORD_ACTION_COOKIE_NAME,
    cookiePath: config.PASSWORD_ACTION_COOKIE_PATH,
    argon2: Object.freeze({
        memoryCost: config.PASSWORD_ARGON2_MEMORY_COST,
        timeCost: config.PASSWORD_ARGON2_TIME_COST,
        parallelism: config.PASSWORD_ARGON2_PARALLELISM,
    }),
    passwordPolicy: Object.freeze({
        minLength: config.PASSWORD_MIN_LENGTH,
        maxLength: config.PASSWORD_MAX_LENGTH,
    }),
});