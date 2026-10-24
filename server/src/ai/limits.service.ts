import { AppError } from '../middleware/error_middleware';
import type { AiUsageNotice, UsageNoticeLevel } from '../interfaces/aiUsage';
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
    period: UsagePeriod;
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
            limit: 1,
            period: 'lifetime',
            bands: [{ below: 1, tier: 'fast' }],
        },
        free: {
            limit: 10,
            period: 'daily',
            bands: [{ below: 9, tier: 'fast' }, { below: 10, tier: 'economy' }],
        },
        free_credits: {
            limit: 20,
            period: 'daily',
            bands: [{ below: 19, tier: 'fast' }, { below: 20, tier: 'economy' }],
        },
        pro: {
            limit: 30,
            period: 'daily',
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

// cv_edit budgets are credits; cv_translate budgets are operations.
export interface AiUsageBudget {
    limit: number;
    period: UsagePeriod;
}

export const getAiUsageBudget = (userType: AiUserType, operation: Feature): AiUsageBudget | null => {
    if (operation === 'cv_edit') {
        const policy = AI_LIMIT_POLICIES.cv_edit[userType];
        return { limit: policy.limit, period: policy.period };
    }
    const policy = AI_LIMIT_POLICIES.cv_translate[userType];
    return policy ? { limit: policy.limit, period: policy.period } : null;
};

const nextUtcMidnight = (now: Date): string =>
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)).toISOString();

// Translate warns once remaining operations reach 20% of the limit, with a minimum of one.
const nearLimitThreshold = (limit: number): number => Math.max(1, Math.ceil(limit * 0.2));

// cv_edit only reports at the limit; a blocked request always reports limit_reached.
export const buildUsageNotice = (
    { userType, feature, used, budget }: { userType: AiUserType; feature: Feature; used: number; budget: AiUsageBudget },
    blocked = false,
): AiUsageNotice | null => {
    const remaining = Math.max(0, budget.limit - used);

    let level: UsageNoticeLevel | null = null;
    if (blocked || remaining <= 0) level = 'limit_reached';
    else if (feature === 'cv_translate' && remaining <= nearLimitThreshold(budget.limit)) level = 'near_limit';
    if (!level) return null;

    return {
        feature,
        userType,
        period: budget.period,
        used,
        limit: budget.limit,
        remaining,
        level,
        resetsAt: budget.period === 'daily' ? nextUtcMidnight(new Date()) : null,
    };
};

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
