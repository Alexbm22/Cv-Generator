import { randomUUID } from 'crypto';
import { Transaction } from 'sequelize';
import sequelize from '@/config/DB/database_config';
import { AiLimitsPolicyService, AiUsageBudget, AiUserType, buildUsageNotice, getAiUsageBudget } from '@/ai/limits.service';
import type { AiUsageNotice } from '@/interfaces/aiUsage';
import type { Feature, ModelTier } from '@/ai/models.catalog';
import { AppError } from '@/middleware/error_middleware';
import type { Actor } from '@/interfaces/actor';
import { ErrorTypes } from '@/interfaces/error';
import { AiUsageDaily, User } from '@/models';
import aiUsageDailyRepository from '@/repositories/aiUsageDaily';
import aiUsageEventRepository from '@/repositories/aiUsageEvent';
import { AiCreditsEstimator, ModelPricing, usdToCredits } from './AiCreditsEstimator';
import type { AiCallOptions } from './chat';
import { resolveAiUserType } from './aiUserType';

// Most to least expensive; a request is downgraded toward the end of this list.
const TIERS_BY_COST: readonly ModelTier[] = ['balanced', 'fast', 'economy'];
const AI_CALL_FAILED = 'AI_CALL_FAILED';

type AiCallUsage = Parameters<AiCallOptions['onCompletion']>[0];
type EstimateFn = (estimator: AiCreditsEstimator) => number;

export interface AiAccess {
    actor: Actor;
    feature: Feature;
    userType: AiUserType;
    budget: AiUsageBudget;
}

export interface MeteredAiCall<T> {
    access: AiAccess;
    signal: AbortSignal;
    estimate: EstimateFn;
    run: (call: AiCallOptions) => Promise<T>;
}

export interface MeteredAiCallResult<T> {
    value: T;
    usageNotice: AiUsageNotice | null;
}

interface Plan {
    tier: ModelTier;
    modelId: string;
    temperature: number;
    pricing: ModelPricing;
    credits: number;
}

interface ReservationContext {
    eventId: number;
    userId: number;
    usageDate: string;
    feature: Feature;
    plan: Plan;
}

const limitsPolicy = new AiLimitsPolicyService();

const today = (): string => new Date().toISOString().slice(0, 10);

const round4 = (value: number): number => Math.round(value * 10_000) / 10_000;

const rejection = (reason: 'not_supported' | 'limit_reached', notice: AiUsageNotice | null = null): AppError =>
    reason === 'not_supported'
        ? new AppError('AI operation is not available for this account', 403, ErrorTypes.INVALID_OPERATION)
        : new AppError('AI usage limit reached', 429, ErrorTypes.TOO_MANY_REQUESTS, { usageNotice: notice });

// cv_edit counts credits; cv_translate counts operations.
const usedFrom = (rows: AiUsageDaily[], feature: Feature): number =>
    rows.reduce((sum, row) => sum + (feature === 'cv_edit' ? Number(row.credits) : row.ops_count), 0);

const loadUsed = async (actor: Actor, feature: Feature, budget: AiUsageBudget, transaction?: Transaction): Promise<number> => {
    const rows = await aiUsageDailyRepository.findAiUsageDaily({
        where: {
            user_id: actor.id,
            operation: feature,
            ...(budget.period === 'daily' ? { usage_date: today() } : {}),
        },
    }, { transaction });
    return usedFrom(rows, feature);
};

// Non-locking early check used by middleware; reservations re-check under a lock.
export const authorizeAiAccess = async (actor: Actor, feature: Feature): Promise<AiAccess> => {
    const userType = await resolveAiUserType(actor);
    const budget = getAiUsageBudget(userType, feature);
    if (!budget) throw rejection('not_supported');

    const used = await loadUsed(actor, feature, budget);
    const decision = limitsPolicy.evaluate({ userType, operation: feature, used });
    if (!decision.allowed) throw rejection(decision.reason, buildUsageNotice({ userType, feature, used, budget }, true));

    return { actor, feature, userType, budget };
};

const priceTiers = (feature: Feature, estimate: EstimateFn): Promise<Plan[]> =>
    Promise.all(TIERS_BY_COST.map(async (tier) => {
        const estimator = await AiCreditsEstimator.forTier(feature, tier);
        return { tier, modelId: estimator.model, temperature: estimator.temperature, pricing: estimator.pricing, credits: estimate(estimator) };
    }));

const selectPlan = (access: AiAccess, tier: ModelTier, used: number, plans: Plan[]): Plan => {
    const candidates = plans.slice(TIERS_BY_COST.indexOf(tier));
    // cv_translate is limited by operation count only, so its tier is never downgraded.
    if (access.feature === 'cv_translate') return candidates[0];

    const remaining = access.budget.limit - used;
    const fit = candidates.find((plan) => plan.credits <= remaining);
    if (!fit) {
        throw rejection('limit_reached', buildUsageNotice({ userType: access.userType, feature: access.feature, used, budget: access.budget }, true));
    }
    return fit;
};

const adjustDaily = (ctx: ReservationContext, deltas: { credits?: number; ops_count?: number }, transaction: Transaction) =>
    aiUsageDailyRepository.incrementAiUsageDailyByKey(
        { user_id: ctx.userId, usage_date: ctx.usageDate, operation: ctx.feature },
        deltas,
        { transaction },
    );

class AiUsageReservation {
    private completed = false;
    private usage: AiCallUsage = null;

    readonly onCompletion: AiCallOptions['onCompletion'] = (usage) => {
        this.completed = true;
        this.usage = usage;
    };

    constructor(private readonly ctx: ReservationContext) {}

    get modelId(): string {
        return this.ctx.plan.modelId;
    }

    get temperature(): number {
        return this.ctx.plan.temperature;
    }

    // Commits when the provider call returned (even if parsing failed later), otherwise releases.
    async settle(): Promise<boolean> {
        try {
            if (this.completed) {
                await this.commit();
                return true;
            }
            await this.release();
        } catch (error) {
            // A failed settlement leaves the estimate counted, which only over-restricts usage.
            console.error('[ai-usage] failed to settle reservation', this.ctx.eventId, error);
        }
        return false;
    }

    private async commit(): Promise<void> {
        const { plan, eventId } = this.ctx;
        const usage = this.usage;
        const costUsd = usage
            ? (usage.inputTokens * plan.pricing.inputPerMTok + usage.outputTokens * plan.pricing.outputPerMTok) / 1_000_000
            : 0;
        // Usage unknown: charge the reserved estimate.
        const actualCredits = usage ? usdToCredits(costUsd) : plan.credits;

        await sequelize.transaction(async (transaction) => {
            await aiUsageEventRepository.updateAiUsageEventById(eventId, {
                status: 'committed',
                input_tokens: usage?.inputTokens ?? 0,
                output_tokens: usage?.outputTokens ?? 0,
                credits: String(actualCredits),
                cost_usd: costUsd.toFixed(6),
                finalized_at: new Date(),
            }, { transaction });
            await adjustDaily(this.ctx, { credits: round4(actualCredits - plan.credits) }, transaction);
        });
    }

    private async release(): Promise<void> {
        const { plan, eventId } = this.ctx;
        await sequelize.transaction(async (transaction) => {
            await aiUsageEventRepository.updateAiUsageEventById(eventId, {
                status: 'released',
                error_code: AI_CALL_FAILED,
                finalized_at: new Date(),
            }, { transaction });
            await adjustDaily(this.ctx, { credits: -plan.credits, ops_count: -1 }, transaction);
        });
    }
}

// Locks the subject row so the read of used credits and the reservation cannot interleave with another request.
const reserve = async (access: AiAccess, estimate: EstimateFn): Promise<AiUsageReservation> => {
    const plans = await priceTiers(access.feature, estimate);
    const { actor, feature, userType, budget } = access;
    const usageDate = today();

    return sequelize.transaction(async (transaction) => {
        await User.findByPk(actor.id, { attributes: ['id'], transaction, lock: transaction.LOCK.UPDATE });
        await aiUsageDailyRepository.findOrCreateAiUsageDaily(
            { user_id: actor.id, usage_date: usageDate, operation: feature },
            { transaction },
        );

        const used = await loadUsed(actor, feature, budget, transaction);
        const decision = limitsPolicy.evaluate({ userType, operation: feature, used });
        if (!decision.allowed) throw rejection(decision.reason, buildUsageNotice({ userType, feature, used, budget }, true));

        const plan = selectPlan(access, decision.tier, used, plans);
        const event = await aiUsageEventRepository.createAiUsageEvent({
            operation_id: randomUUID(),
            user_id: actor.id,
            operation: feature,
            model_tier: plan.tier,
            model_id: plan.modelId,
            credits: String(plan.credits),
            status: 'reserved',
        }, { transaction });

        const ctx: ReservationContext = { eventId: event.id, userId: actor.id, usageDate, feature, plan };
        await adjustDaily(ctx, { credits: plan.credits, ops_count: 1 }, transaction);

        return new AiUsageReservation(ctx);
    });
};

// Notice failures are logged and dropped so they never fail a completed AI call.
const noticeAfterCall = async (access: AiAccess): Promise<AiUsageNotice | null> => {
    try {
        const used = await loadUsed(access.actor, access.feature, access.budget);
        return buildUsageNotice({ userType: access.userType, feature: access.feature, used, budget: access.budget });
    } catch (error) {
        console.error('[ai-usage] failed to build usage notice', error);
        return null;
    }
};

export const runMeteredAiCall = async <T>({ access, signal, estimate, run }: MeteredAiCall<T>): Promise<MeteredAiCallResult<T>> => {
    const reservation = await reserve(access, estimate);
    let committed = false;
    let value: T;
    try {
        value = await run({ modelId: reservation.modelId, temperature: reservation.temperature, signal, onCompletion: reservation.onCompletion });
    } finally {
        committed = await reservation.settle();
    }
    return { value, usageNotice: committed ? await noticeAfterCall(access) : null };
};
