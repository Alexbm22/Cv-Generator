import dotenv from 'dotenv';
import { validateEnv } from './envSchema';

dotenv.config();

const result = validateEnv(process.env);
if (!result.success) {
    console.error('Invalid environment configuration (values are not printed):');
    for (const error of result.errors) {
        console.error(`  - ${error}`);
    }
    process.exit(1);
}

export type { Env } from './envSchema';
export const config = result.data;

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