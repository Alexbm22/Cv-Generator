import { Optional } from 'sequelize';
import type { ModelTier } from '../ai/models.catalog';
import { FEATURES } from '../ai/models.catalog';

export const AI_USAGE_OPERATIONS = FEATURES;
export type AiUsageOperation = (typeof AI_USAGE_OPERATIONS)[number];

export const AI_USAGE_STATUSES = ['reserved', 'committed', 'released'] as const;
export type AiUsageStatus = (typeof AI_USAGE_STATUSES)[number];

export interface AiUsageEventAttributes {
    id: number;
    action_id: string | null;
    operation_id: string;
    user_id: number | null;
    guest_key: string | null;
    operation: AiUsageOperation;
    model_tier: ModelTier;
    model_id: string;
    input_tokens: number;
    output_tokens: number;
    // DECIMAL columns are returned as strings to preserve precision.
    equiv_tokens: string;
    cost_usd: string;
    status: AiUsageStatus;
    error_code: string | null;
    created_at: Date;
    finalized_at: Date | null;
}

export interface AiUsageEventCreationAttributes extends Optional<AiUsageEventAttributes,
    | 'id'
    | 'action_id'
    | 'user_id'
    | 'guest_key'
    | 'input_tokens'
    | 'output_tokens'
    | 'equiv_tokens'
    | 'cost_usd'
    | 'error_code'
    | 'created_at'
    | 'finalized_at'
> {}

export interface AiUsageDailyAttributes {
    // Format: "user:<id>" or "guest:<guest_key>".
    subject_key: string;
    // UTC calendar day in YYYY-MM-DD form.
    usage_date: string;
    operation: AiUsageOperation;
    // DECIMAL columns are returned as strings to preserve precision.
    equiv_tokens: string;
    ops_count: number;
}

export interface AiUsageDailyCreationAttributes extends Optional<AiUsageDailyAttributes,
    | 'equiv_tokens'
    | 'ops_count'
> {}
