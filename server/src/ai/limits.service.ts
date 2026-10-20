import { AppError } from '../middleware/error_middleware';
import { ErrorTypes } from '../interfaces/error';
import { Feature, isFeature, ModelTier } from './models.catalog';

export const AI_USER_TYPES = ['guest', 'free', 'free_credits', 'pro'] as const;
export type AiUserType = (typeof AI_USER_TYPES)[number];

// Lifetime periods take the account's total count; daily periods take the current day's count.
export type UsagePeriod = 'daily' | 'lifetime';

// Tier applies while used < below; bands are ascending and must end at the limit.
interface TierBand {
    below: number;
    tier: ModelTier;
}

interface CreditPolicy {
    limit: number;
    bands: readonly TierBand[];
}

interface TranslatePolicy {
    limit: number;
    period: UsagePeriod;
    tier: ModelTier;
}


export const AI_LIMIT_POLICIES: {
    cv_edit: Record<AiUserType, CreditPolicy>;
    cv_translate: Record<AiUserType, TranslatePolicy | null>;
} = {
    cv_edit: {
        guest: {
            limit: 5,
            bands: [{ below: 4, tier: 'fast' }, { below: 5, tier: 'economy' }],
        },
        free: {
            limit: 10,
            bands: [{ below: 9, tier: 'fast' }, { below: 10, tier: 'economy' }],
        },
        free_credits: {
            limit: 20,
            bands: [{ below: 19, tier: 'fast' }, { below: 20, tier: 'economy' }],
        },
        pro: {
            limit: 30,
            bands: [
                { below: 11, tier: 'balanced' },
                { below: 29, tier: 'fast' },
                { below: 30, tier: 'economy' },
            ],
        },
    },
    cv_translate: {
        guest: null,
        free: { limit: 2, period: 'lifetime', tier: 'fast' },
        free_credits: { limit: 10, period: 'daily', tier: 'fast' },
        pro: { limit: 20, period: 'daily', tier: 'fast' },
    },
};

export interface AiAccessRequest {
    userType: AiUserType;
    operation: Feature;
    used: number;
}

export type AiAccessDecision =
    | { allowed: true; tier: ModelTier }
    | { allowed: false; reason: 'not_supported' | 'limit_reached' };

const isAiUserType = (value: unknown): value is AiUserType =>
    typeof value === 'string' && (AI_USER_TYPES as readonly string[]).includes(value);

export class AiLimitsPolicyService {
    evaluate({ userType, operation, used }: AiAccessRequest): AiAccessDecision {
        if (!isAiUserType(userType)) {
            throw new AppError('Invalid AI user type', 400, ErrorTypes.VALIDATION_ERR);
        }
        if (!isFeature(operation)) {
            throw new AppError('Unsupported AI operation', 400, ErrorTypes.INVALID_OPERATION);
        }
        if (!Number.isFinite(used) || used < 0) {
            throw new AppError('Invalid AI usage value', 400, ErrorTypes.VALIDATION_ERR);
        }

        return operation === 'cv_translate'
            ? this.evaluateTranslate(userType, used)
            : this.evaluateEdit(userType, used);
    }

    private evaluateEdit(userType: AiUserType, used: number): AiAccessDecision {
        const policy = AI_LIMIT_POLICIES.cv_edit[userType];
        if (used >= policy.limit) return { allowed: false, reason: 'limit_reached' };

        const band = policy.bands.find((candidate) => used < candidate.below);
        if (!band) return { allowed: false, reason: 'limit_reached' };

        return { allowed: true, tier: band.tier };
    }

    private evaluateTranslate(userType: AiUserType, used: number): AiAccessDecision {
        const policy = AI_LIMIT_POLICIES.cv_translate[userType];
        if (!policy) return { allowed: false, reason: 'not_supported' };
        if (used >= policy.limit) return { allowed: false, reason: 'limit_reached' };

        return { allowed: true, tier: policy.tier };
    }
}
