import argon2, { HashOptions } from 'argon2';
import { passwordActionConfig } from '../config/env';

const argon2Options: HashOptions = {
    type: argon2.argon2id,
    ...passwordActionConfig.argon2,
};

export class PasswordHasher {
    public static hash(plain: string): Promise<string> {
        return argon2.hash(plain, argon2Options);
    }

    public static async verify(hash: string, plain: string): Promise<boolean> {
        if (!hash.startsWith('$argon2id$')) {
            return false;
        }

        try {
            return await argon2.verify(hash, plain);
        } catch {
            return false;
        }
    }

    public static needsRehash(hash: string): boolean {
        const match = /^\$argon2id\$v=19\$m=(\d+),t=(\d+),p=(\d+)\$/.exec(hash);
        if (!match) {
            return true;
        }

        const memoryCost = Number(match[1]);
        const timeCost = Number(match[2]);
        const parallelism = Number(match[3]);
        return memoryCost < passwordActionConfig.argon2.memoryCost
            || timeCost < passwordActionConfig.argon2.timeCost
            || parallelism < passwordActionConfig.argon2.parallelism;
    }
}