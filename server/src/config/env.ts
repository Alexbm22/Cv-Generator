import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

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
    AWS_ACESS_KEY_ID: z.string(),
    AWS_SECRET_ACESS_KEY: z.string(),

    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_ID_SALT: z.string(),

    STRIPE_SECRET_KEY: z.string(),
    STRIPE_WEBHOOK_SECRET: z.string(),
});

const parsed = envSchema.safeParse(process.env);
if(!parsed.success) {
    console.error("Invalid environment variables:", parsed.error);
    process.exit(1);
}

export type Env = z.infer<typeof envSchema>;
export const config = parsed.data;