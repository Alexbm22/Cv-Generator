import { Order, Transaction, WhereOptions } from 'sequelize';
import { AiUsageDailyAttributes, AiUsageDailyCreationAttributes } from '@/interfaces/aiUsage';
import { AiUsageDaily } from '@/models';

export interface AiUsageDailyQuery {
    where?: WhereOptions<AiUsageDailyAttributes>;
    order?: Order;
    limit?: number;
}

type AiUsageDailyKey = Pick<AiUsageDailyAttributes, 'user_id' | 'usage_date' | 'operation'>;
type AiUsageDailyCounters = Partial<Pick<AiUsageDailyAttributes, 'credits' | 'ops_count'>>;
type AiUsageDailyDeltas = { credits?: number; ops_count?: number };
type WriteOptions = { transaction?: Transaction };
type ReadOptions = WriteOptions & { lock?: boolean };

const toLock = (options: ReadOptions) =>
    options.lock && options.transaction ? options.transaction.LOCK.UPDATE : undefined;

const createAiUsageDaily = async (data: AiUsageDailyCreationAttributes, options: WriteOptions = {}) => {
    return await AiUsageDaily.create(data, { transaction: options.transaction });
};

const findAiUsageDailyByKey = async (key: AiUsageDailyKey, options: ReadOptions = {}) => {
    return await AiUsageDaily.findOne({
        where: key,
        transaction: options.transaction,
        lock: toLock(options),
    });
};

const findAiUsageDaily = async (query: AiUsageDailyQuery = {}, options: ReadOptions = {}) => {
    return await AiUsageDaily.findAll({
        where: query.where,
        order: query.order ?? [['usage_date', 'ASC']],
        limit: query.limit,
        transaction: options.transaction,
        lock: toLock(options),
    });
};

const findOrCreateAiUsageDaily = async (key: AiUsageDailyKey, options: WriteOptions = {}) => {
    const [row, created] = await AiUsageDaily.findOrCreate({
        where: key,
        defaults: key,
        transaction: options.transaction,
    });
    return { row, created };
};

const updateAiUsageDailyByKey = async (key: AiUsageDailyKey, changes: AiUsageDailyCounters, options: WriteOptions = {}) => {
    const [updatedCount] = await AiUsageDaily.update(changes, {
        where: key,
        transaction: options.transaction,
    });
    return updatedCount > 0;
};

// Uses a single SQL UPDATE so concurrent increments do not lose updates.
const incrementAiUsageDailyByKey = async (key: AiUsageDailyKey, deltas: AiUsageDailyDeltas, options: WriteOptions = {}) => {
    await AiUsageDaily.increment(deltas, {
        where: key,
        transaction: options.transaction,
    });
};

export default {
    createAiUsageDaily,
    findAiUsageDailyByKey,
    findAiUsageDaily,
    findOrCreateAiUsageDaily,
    updateAiUsageDailyByKey,
    incrementAiUsageDailyByKey,
};
