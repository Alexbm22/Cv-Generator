import { DataTypes, QueryInterface } from 'sequelize';

const TABLE = 'ai_plan_policy';

export async function up({ context: qi }: { context: QueryInterface }): Promise<void> {
    if (await qi.tableExists(TABLE)) return;

    await qi.createTable(TABLE, {
        plan_id: { type: DataTypes.STRING(64), primaryKey: true, allowNull: false },
        feature: { type: DataTypes.STRING(32), primaryKey: true, allowNull: false },
        model_tier: { type: DataTypes.STRING(16), allowNull: false },
        max_input_tokens: { type: DataTypes.INTEGER, allowNull: false },
        max_output_tokens: { type: DataTypes.INTEGER, allowNull: false },
    });

    await qi.sequelize.query(
        `ALTER TABLE ${TABLE} ADD CONSTRAINT ai_plan_policy_positive_limits ` +
        `CHECK (max_input_tokens > 0 AND max_output_tokens > 0)`,
    );
}

export async function down({ context: qi }: { context: QueryInterface }): Promise<void> {
    await qi.dropTable(TABLE);
}
