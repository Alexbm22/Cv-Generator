import { Optional } from 'sequelize';
import type { Feature, ModelTier } from '../ai/models.catalog';
import { FEATURES } from '../ai/models.catalog';
import type { AiUserType, UsagePeriod } from '../ai/limits.service';

export const AI_USAGE_OPERATIONS = FEATURES;
export type AiUsageOperation = (typeof AI_USAGE_OPERATIONS)[number];

export const AI_USAGE_STATUSES = ['reserved', 'committed', 'released'] as const;
export type AiUsageStatus = (typeof AI_USAGE_STATUSES)[number];

export interface AiUsageEventAttributes {
    id: number;
    operation_id: string;
    user_id: number;
    operation: AiUsageOperation;
    model_tier: ModelTier;
    model_id: string;
    input_tokens: number;
    output_tokens: number;
    // DECIMAL columns are returned as strings to preserve precision.
    credits: string;
    cost_usd: string;
    status: AiUsageStatus;
    error_code: string | null;
    created_at: Date;
    finalized_at: Date | null;
}

export interface AiUsageEventCreationAttributes extends Optional<AiUsageEventAttributes,
    | 'id'
    | 'input_tokens'
    | 'output_tokens'
    | 'credits'
    | 'cost_usd'
    | 'error_code'
    | 'created_at'
    | 'finalized_at'
> {}

export interface AiUsageDailyAttributes {
    user_id: number;
    // UTC calendar day in YYYY-MM-DD form.
    usage_date: string;
    operation: AiUsageOperation;
    // Total credits consumed that day; DECIMAL is returned as a string.
    credits: string;
    ops_count: number;
}

export interface AiUsageDailyCreationAttributes extends Optional<AiUsageDailyAttributes,
    | 'credits'
    | 'ops_count'
> {}

export type UsageNoticeLevel = 'near_limit' | 'limit_reached';

export interface AiUsageNotice {
    feature: Feature;
    userType: AiUserType;
    period: UsagePeriod;
    used: number;
    limit: number;
    remaining: number;
    level: UsageNoticeLevel;
    // Next UTC midnight for daily budgets; null for lifetime budgets.
    resetsAt: string | null;
}
