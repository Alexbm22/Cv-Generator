import { QueryInterface, QueryTypes } from 'sequelize';
import { MODEL_TIERS } from '../../ai/models.catalog';
import { AI_USAGE_OPERATIONS, AI_USAGE_STATUSES } from '../../interfaces/aiUsage';

export const AI_USAGE_EVENTS_TABLE = 'ai_usage_events';
export const AI_USAGE_DAILY_TABLE = 'ai_usage_daily';

interface IndexSpec {
    name: string;
    fields: string[];
}

interface CheckSpec {
    name: string;
    expression: string;
}

const sqlList = (values: readonly string[]): string => values.map((value) => `'${value}'`).join(', ');

export const AI_USAGE_EVENTS_INDEXES: readonly IndexSpec[] = [
    { name: 'ai_usage_events_user_operation_status_idx', fields: ['user_id', 'operation', 'status'] },
    { name: 'ai_usage_events_guest_operation_status_idx', fields: ['guest_key', 'operation', 'status'] },
    { name: 'ai_usage_events_operation_id_idx', fields: ['operation_id'] },
    { name: 'ai_usage_events_action_id_idx', fields: ['action_id'] },
];

const AI_USAGE_EVENTS_CHECKS: readonly CheckSpec[] = [
    { name: 'ai_usage_events_single_subject', expression: '(user_id IS NULL) <> (guest_key IS NULL)' },
    {
        name: 'ai_usage_events_non_negative',
        expression: 'input_tokens >= 0 AND output_tokens >= 0 AND equiv_tokens >= 0 AND cost_usd >= 0',
    },
    { name: 'ai_usage_events_operation_valid', expression: `operation IN (${sqlList(AI_USAGE_OPERATIONS)})` },
    { name: 'ai_usage_events_status_valid', expression: `status IN (${sqlList(AI_USAGE_STATUSES)})` },
    { name: 'ai_usage_events_model_tier_valid', expression: `model_tier IN (${sqlList(MODEL_TIERS)})` },
];

const AI_USAGE_DAILY_CHECKS: readonly CheckSpec[] = [
    { name: 'ai_usage_daily_non_negative', expression: 'equiv_tokens >= 0 AND ops_count >= 0' },
    { name: 'ai_usage_daily_operation_valid', expression: `operation IN (${sqlList(AI_USAGE_OPERATIONS)})` },
    {
        name: 'ai_usage_daily_subject_key_valid',
        expression: "subject_key LIKE 'user:%' OR subject_key LIKE 'guest:%'",
    },
];

const currentSchema = (qi: QueryInterface): string =>
    qi.sequelize.getDialect() === 'postgres' ? 'current_schema()' : 'DATABASE()';

const constraintExists = async (qi: QueryInterface, table: string, name: string): Promise<boolean> => {
    const rows = await qi.sequelize.query(
        'SELECT 1 FROM information_schema.table_constraints ' +
        `WHERE table_schema = ${currentSchema(qi)} AND table_name = :table AND constraint_name = :name`,
        { replacements: { table, name }, type: QueryTypes.SELECT },
    );
    return rows.length > 0;
};

const ensureIndex = async (qi: QueryInterface, table: string, { name, fields }: IndexSpec): Promise<void> => {
    const indexes = (await qi.showIndex(table)) as Array<{ name: string }>;
    if (indexes.some((index) => index.name === name)) return;
    await qi.addIndex(table, fields, { name });
};

const ensureCheck = async (qi: QueryInterface, table: string, { name, expression }: CheckSpec): Promise<void> => {
    if (await constraintExists(qi, table, name)) return;
    await qi.sequelize.query(`ALTER TABLE ${table} ADD CONSTRAINT ${name} CHECK (${expression})`);
};

const ensureUserForeignKey = async (qi: QueryInterface, table: string): Promise<void> => {
    if (!(await qi.tableExists('users'))) {
        console.warn(`[ai-usage] users table missing; ${table}.user_id foreign key deferred to server start`);
        return;
    }

    const name = `${table}_user_id_fk`;
    if (await constraintExists(qi, table, name)) return;

    // No ON UPDATE CASCADE: MySQL rejects CHECK constraints on columns with cascading updates.
    await qi.addConstraint(table, {
        type: 'foreign key',
        name,
        fields: ['user_id'],
        references: { table: 'users', field: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
    });
};

export const ensureAiUsageEventsSchema = async (qi: QueryInterface): Promise<void> => {
    for (const index of AI_USAGE_EVENTS_INDEXES) {
        await ensureIndex(qi, AI_USAGE_EVENTS_TABLE, index);
    }
    for (const check of AI_USAGE_EVENTS_CHECKS) {
        await ensureCheck(qi, AI_USAGE_EVENTS_TABLE, check);
    }
    await ensureUserForeignKey(qi, AI_USAGE_EVENTS_TABLE);
};

export const ensureAiUsageDailySchema = async (qi: QueryInterface): Promise<void> => {
    for (const check of AI_USAGE_DAILY_CHECKS) {
        await ensureCheck(qi, AI_USAGE_DAILY_TABLE, check);
    }
};
