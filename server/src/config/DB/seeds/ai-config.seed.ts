import sequelize from '../database_config';
import AiModelPrice from '../../../models/AiModelPrice';
import AiPlanPolicy from '../../../models/AiPlanPolicy';
import { FEATURES, Feature, ModelId, MODEL_CATALOG, ModelTier, PLAN_IDS, PlanId } from '../../../ai/models.catalog';

// Source: https://developers.openai.com/api/docs/pricing (standard, short context), verified 2026-10-17.
const PRICE_EFFECTIVE_FROM = new Date('2026-10-17T00:00:00Z');

const MODEL_PRICES: Record<ModelId, { input: string; output: string }> = {
    'gpt-6-luna': { input: '0.100000', output: '0.500000' },
    'gpt-6.1-sol': { input: '2.000000', output: '10.000000' },
    'gpt-4.1-nano': { input: '0.100000', output: '0.400000' },
};

// Limits are product defaults to confirm; they are only inserted when missing.
const POLICY_SEED: Record<PlanId, Record<Feature, { tier: ModelTier; maxInputTokens: number; maxOutputTokens: number }>> = {
    free: {
        cv_edit: { tier: 'fast', maxInputTokens: 16_000, maxOutputTokens: 4_000 },
        section_edit: { tier: 'fast', maxInputTokens: 4_000, maxOutputTokens: 1_000 },
        translate: { tier: 'fast', maxInputTokens: 16_000, maxOutputTokens: 4_000 },
    },
    credits_pack: {
        cv_edit: { tier: 'balanced', maxInputTokens: 32_000, maxOutputTokens: 8_000 },
        section_edit: { tier: 'balanced', maxInputTokens: 8_000, maxOutputTokens: 2_000 },
        translate: { tier: 'balanced', maxInputTokens: 64_000, maxOutputTokens: 16_000 },
    },
    full_access: {
        cv_edit: { tier: 'balanced', maxInputTokens: 32_000, maxOutputTokens: 8_000 },
        section_edit: { tier: 'balanced', maxInputTokens: 8_000, maxOutputTokens: 2_000 },
        translate: { tier: 'balanced', maxInputTokens: 64_000, maxOutputTokens: 16_000 },
    },
    limited: {
        cv_edit: { tier: 'economy', maxInputTokens: 16_000, maxOutputTokens: 4_000 },
        section_edit: { tier: 'economy', maxInputTokens: 4_000, maxOutputTokens: 1_000 },
        translate: { tier: 'economy', maxInputTokens: 16_000, maxOutputTokens: 4_000 },
    },
};

export async function seedAiConfig(): Promise<void> {
    await sequelize.transaction(async (transaction) => {
        for (const modelId of Object.keys(MODEL_PRICES) as ModelId[]) {
            const price = MODEL_PRICES[modelId];
            const open = await AiModelPrice.findOne({
                where: { model_id: modelId, effective_to: null },
                transaction,
            });

            if (open && Number(open.input_per_mtok) === Number(price.input)
                && Number(open.output_per_mtok) === Number(price.output)) {
                continue;
            }

            if (open) {
                if (open.effective_from >= PRICE_EFFECTIVE_FROM) {
                    throw new Error(`Cannot close price for ${modelId}: open row starts after the new price`);
                }
                open.effective_to = PRICE_EFFECTIVE_FROM;
                await open.save({ transaction });
            }

            await AiModelPrice.create({
                model_id: modelId,
                input_per_mtok: price.input,
                output_per_mtok: price.output,
                effective_from: PRICE_EFFECTIVE_FROM,
                effective_to: null,
            }, { transaction });
        }

        for (const planId of PLAN_IDS) {
            for (const feature of FEATURES) {
                const seed = POLICY_SEED[planId][feature];
                if (seed.maxOutputTokens > MODEL_CATALOG[seed.tier].maxOutput) {
                    throw new Error(`Seed output limit exceeds catalog for ${planId}/${feature}`);
                }
                await AiPlanPolicy.findOrCreate({
                    where: { plan_id: planId, feature },
                    defaults: {
                        plan_id: planId,
                        feature,
                        model_tier: seed.tier,
                        max_input_tokens: seed.maxInputTokens,
                        max_output_tokens: seed.maxOutputTokens,
                    },
                    transaction,
                });
            }
        }
    });
}
