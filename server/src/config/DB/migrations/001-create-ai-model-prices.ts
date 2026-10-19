import { DataTypes, QueryInterface } from 'sequelize';

const TABLE = 'ai_model_prices';
const OPEN_PRICE_INDEX = 'ai_model_prices_one_open_price';

export async function up({ context: qi }: { context: QueryInterface }): Promise<void> {
    if (await qi.tableExists(TABLE)) return;

    await qi.createTable(TABLE, {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
        model_id: { type: DataTypes.STRING(64), allowNull: false },
        input_per_mtok: { type: DataTypes.DECIMAL(12, 6), allowNull: false },
        output_per_mtok: { type: DataTypes.DECIMAL(12, 6), allowNull: false },
        effective_from: { type: DataTypes.DATE, allowNull: false },
        effective_to: { type: DataTypes.DATE, allowNull: true },
    });

    await qi.addIndex(TABLE, ['model_id', 'effective_from'], {
        name: 'ai_model_prices_model_effective_from_idx',
    });

    await qi.sequelize.query(
        `ALTER TABLE ${TABLE} ADD CONSTRAINT ai_model_prices_non_negative ` +
        `CHECK (input_per_mtok >= 0 AND output_per_mtok >= 0)`,
    );
    await qi.sequelize.query(
        `ALTER TABLE ${TABLE} ADD CONSTRAINT ai_model_prices_valid_period ` +
        `CHECK (effective_to IS NULL OR effective_to > effective_from)`,
    );

    // Partial unique indexes are PostgreSQL-only; other dialects rely on seed/transaction logic.
    if (qi.sequelize.getDialect() === 'postgres') {
        await qi.sequelize.query(
            `CREATE UNIQUE INDEX ${OPEN_PRICE_INDEX} ON ${TABLE} (model_id) WHERE effective_to IS NULL`,
        );
    } else {
        console.warn(`[migration] ${OPEN_PRICE_INDEX} skipped: partial indexes unsupported on this dialect`);
    }
}

export async function down({ context: qi }: { context: QueryInterface }): Promise<void> {
    await qi.dropTable(TABLE);
}
