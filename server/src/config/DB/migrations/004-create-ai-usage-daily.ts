import { DataTypes, QueryInterface } from 'sequelize';
import { AI_USAGE_DAILY_TABLE, ensureAiUsageDailySchema } from '../aiUsageSchema';

const TABLE = AI_USAGE_DAILY_TABLE;

export async function up({ context: qi }: { context: QueryInterface }): Promise<void> {
    if (!(await qi.tableExists(TABLE))) {
        await createTable(qi);
    }

    await ensureAiUsageDailySchema(qi);
}

async function createTable(qi: QueryInterface): Promise<void> {
    await qi.createTable(TABLE, {
        subject_key: { type: DataTypes.STRING(128), allowNull: false, primaryKey: true },
        usage_date: { type: DataTypes.DATEONLY, allowNull: false, primaryKey: true },
        operation: { type: DataTypes.STRING(32), allowNull: false, primaryKey: true },
        equiv_tokens: { type: DataTypes.DECIMAL(20, 4), allowNull: false, defaultValue: 0 },
        ops_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    });
}

export async function down({ context: qi }: { context: QueryInterface }): Promise<void> {
    await qi.dropTable(TABLE);
}
