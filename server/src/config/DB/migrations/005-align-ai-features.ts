import { QueryInterface } from 'sequelize';

const TABLE = 'ai_plan_policy';

// Re-run `seed:ai` afterwards to restore any cv_translate rows removed here.
export async function up({ context: qi }: { context: QueryInterface }): Promise<void> {
    await qi.bulkDelete(TABLE, { feature: 'section_edit' });
    await qi.bulkDelete(TABLE, { feature: 'cv_translate' });
    await qi.bulkUpdate(TABLE, { feature: 'cv_translate' }, { feature: 'translate' });
}

export async function down({ context: qi }: { context: QueryInterface }): Promise<void> {
    await qi.bulkUpdate(TABLE, { feature: 'translate' }, { feature: 'cv_translate' });
}
