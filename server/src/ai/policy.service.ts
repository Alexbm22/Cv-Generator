import AiPlanPolicy from '../models/AiPlanPolicy';
import {
    DEFAULT_LIMITS,
    DEFAULT_TIER,
    Feature,
    isModelTier,
    MODEL_CATALOG,
    ModelId,
    ModelTier,
    TokenLimits,
} from './models.catalog';

export interface ResolvedModelPolicy {
    model: ModelId;
    tier: ModelTier;
    limits: TokenLimits;
}

const CACHE_TTL_MS = 60_000;

const cache = new Map<string, { value: ResolvedModelPolicy; expiresAt: number }>();

const cacheKey = (planId: string, feature: Feature): string => `${planId}:${feature}`;

const copyPolicy = (policy: ResolvedModelPolicy): ResolvedModelPolicy => ({
    ...policy,
    limits: { ...policy.limits },
});

const fallbackPolicy = (feature: Feature): ResolvedModelPolicy => {
    const tier = DEFAULT_TIER[feature];
    return { model: MODEL_CATALOG[tier].id, tier, limits: { ...DEFAULT_LIMITS[feature] } };
};

const isPositiveInteger = (value: unknown): value is number =>
    typeof value === 'number' && Number.isSafeInteger(value) && value > 0;

// Returns null when the stored row is unusable.
const validatePolicy = (row: AiPlanPolicy): ResolvedModelPolicy | null => {
    if (!isModelTier(row.model_tier)) return null;

    const spec = MODEL_CATALOG[row.model_tier];
    const maxInputTokens = row.max_input_tokens;
    const maxOutputTokens = row.max_output_tokens;

    if (!isPositiveInteger(maxInputTokens) || !isPositiveInteger(maxOutputTokens)) return null;
    if (maxOutputTokens > spec.maxOutput) return null;
    if (maxInputTokens + maxOutputTokens > spec.contextWindow) return null;

    return {
        model: spec.id,
        tier: row.model_tier,
        limits: { maxInputTokens, maxOutputTokens },
    };
};

export async function resolveModelPolicy(feature: Feature, planId: string): Promise<ResolvedModelPolicy> {
    const key = cacheKey(planId, feature);
    const cached = cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
        return copyPolicy(cached.value);
    }

    let resolved: ResolvedModelPolicy;
    try {
        const row = await AiPlanPolicy.findOne({ where: { plan_id: planId, feature } });
        const validated = row ? validatePolicy(row) : null;

        if (!validated) {
            console.warn(`[ai-policy] Missing or invalid policy for plan "${planId}" / feature "${feature}", using defaults`);
            resolved = fallbackPolicy(feature);
        } else {
            resolved = validated;
        }
    } catch (error) {
        // Not cached, so the next call retries the database.
        console.error('[ai-policy] Failed to load policy, using defaults', error);
        return fallbackPolicy(feature);
    }

    cache.set(key, { value: resolved, expiresAt: Date.now() + CACHE_TTL_MS });
    return copyPolicy(resolved);
}

export function invalidatePolicyCache(planId?: string, feature?: Feature): void {
    for (const key of cache.keys()) {
        const [cachedPlan, cachedFeature] = key.split(':');
        if ((planId === undefined || cachedPlan === planId)
            && (feature === undefined || cachedFeature === feature)) {
            cache.delete(key);
        }
    }
}
