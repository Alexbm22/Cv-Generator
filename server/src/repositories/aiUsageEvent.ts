import { Order, Transaction, WhereOptions } from 'sequelize';
import { AiUsageEventAttributes, AiUsageEventCreationAttributes } from '@/interfaces/aiUsage';
import { AiUsageEvent } from '@/models';

export interface AiUsageEventQuery {
    where?: WhereOptions<AiUsageEventAttributes>;
    order?: Order;
    limit?: number;
}

type WriteOptions = { transaction?: Transaction };
type ReadOptions = WriteOptions & { lock?: boolean };

const toLock = (options: ReadOptions) =>
    options.lock && options.transaction ? options.transaction.LOCK.UPDATE : undefined;

const createAiUsageEvent = async (data: AiUsageEventCreationAttributes, options: WriteOptions = {}) => {
    return await AiUsageEvent.create(data, { transaction: options.transaction });
};

const findAiUsageEventById = async (id: number, options: ReadOptions = {}) => {
    return await AiUsageEvent.findByPk(id, {
        transaction: options.transaction,
        lock: toLock(options),
    });
};

const findAiUsageEvents = async (query: AiUsageEventQuery = {}, options: ReadOptions = {}) => {
    return await AiUsageEvent.findAll({
        where: query.where,
        order: query.order ?? [['id', 'ASC']],
        limit: query.limit,
        transaction: options.transaction,
        lock: toLock(options),
    });
};

const findAiUsageEventsByOperationId = async (operation_id: string, options: ReadOptions = {}) => {
    return await findAiUsageEvents({ where: { operation_id } }, options);
};

const countAiUsageEvents = async (where: WhereOptions<AiUsageEventAttributes> = {}, options: WriteOptions = {}) => {
    return await AiUsageEvent.count({
        where,
        transaction: options.transaction,
    });
};

const updateAiUsageEventById = async (
    id: number,
    changes: Partial<Omit<AiUsageEventAttributes, 'id'>>,
    options: WriteOptions = {}
) => {
    const [updatedCount] = await AiUsageEvent.update(changes, {
        where: { id },
        transaction: options.transaction,
    });
    return updatedCount > 0;
};

export default {
    createAiUsageEvent,
    findAiUsageEventById,
    findAiUsageEvents,
    findAiUsageEventsByOperationId,
    countAiUsageEvents,
    updateAiUsageEventById,
};
