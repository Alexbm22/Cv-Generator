// Model IDs and limits verified against https://developers.openai.com/api/docs/models on 2026-10-17.
export const MODEL_CATALOG = {
    fast: { id: 'gpt-6-luna', contextWindow: 1_050_000, maxOutput: 128_000 },
    balanced: { id: 'gpt-6.1-sol', contextWindow: 1_050_000, maxOutput: 128_000 },
    economy: { id: 'gpt-4.1-nano', contextWindow: 1_047_576, maxOutput: 32_768 },
} as const;

export type ModelTier = keyof typeof MODEL_CATALOG;
export type ModelId = (typeof MODEL_CATALOG)[ModelTier]['id'];
export const MODEL_TIERS = Object.keys(MODEL_CATALOG) as ModelTier[];

export const FEATURES = ['cv_edit', 'cv_translate'] as const;
export type Feature = (typeof FEATURES)[number];

// 'limited' is for authenticated users past the usage threshold; gating is not implemented yet.
export const PLAN_IDS = ['free', 'credits_pack', 'full_access', 'limited'] as const;
export type PlanId = (typeof PLAN_IDS)[number];

export interface TokenLimits {
    maxInputTokens: number;
    maxOutputTokens: number;
}

// Code-defined fallbacks used when a stored policy is missing or invalid.
export const DEFAULT_TIER: Record<Feature, ModelTier> = {
    cv_edit: 'balanced',
    cv_translate: 'balanced',
};

export const DEFAULT_LIMITS: Record<Feature, TokenLimits> = {
    cv_edit: { maxInputTokens: 32_000, maxOutputTokens: 8_000 },
    cv_translate: { maxInputTokens: 64_000, maxOutputTokens: 16_000 },
};

export const isModelTier = (value: unknown): value is ModelTier =>
    typeof value === 'string' && (MODEL_TIERS as string[]).includes(value);

export const isFeature = (value: unknown): value is Feature =>
    typeof value === 'string' && (FEATURES as readonly string[]).includes(value);
