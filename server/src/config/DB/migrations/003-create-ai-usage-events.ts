import { DataTypes, QueryInterface, literal } from 'sequelize';
import { AI_USAGE_EVENTS_TABLE, ensureAiUsageEventsSchema } from '../aiUsageSchema';

const TABLE = AI_USAGE_EVENTS_TABLE;

export async function up({ context: qi }: { context: QueryInterface }): Promise<void> {
    if (!(await qi.tableExists(TABLE))) {
        await createTable(qi);
    }

    await ensureAiUsageEventsSchema(qi);
}

async function createTable(qi: QueryInterface): Promise<void> {
    await qi.createTable(TABLE, {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
        action_id: { type: DataTypes.STRING(64), allowNull: true },
        operation_id: { type: DataTypes.STRING(64), allowNull: false },
        user_id: { type: DataTypes.INTEGER, allowNull: true },
        guest_key: { type: DataTypes.STRING(64), allowNull: true },
        operation: { type: DataTypes.STRING(32), allowNull: false },
        model_tier: { type: DataTypes.STRING(16), allowNull: false },
        model_id: { type: DataTypes.STRING(64), allowNull: false },
        input_tokens: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        output_tokens: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        equiv_tokens: { type: DataTypes.DECIMAL(20, 4), allowNull: false, defaultValue: 0 },
        cost_usd: { type: DataTypes.DECIMAL(12, 6), allowNull: false, defaultValue: 0 },
        status: { type: DataTypes.STRING(16), allowNull: false },
        error_code: { type: DataTypes.STRING(64), allowNull: true },
        created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: literal('CURRENT_TIMESTAMP') },
        finalized_at: { type: DataTypes.DATE, allowNull: true },
    });
}

export async function down({ context: qi }: { context: QueryInterface }): Promise<void> {
    await qi.dropTable(TABLE);
}
