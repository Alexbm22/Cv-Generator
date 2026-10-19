import { Op } from 'sequelize';
import AiModelPrice from '../models/AiModelPrice';
import { AppError } from '../middleware/error_middleware';
import { ErrorTypes } from '../interfaces/error';

const CACHE_TTL_MS = 60_000;

export interface PriceSnapshot {
    modelId: string;
    inputPerMTok: string;
    outputPerMTok: string;
    effectiveFrom: Date;
    effectiveTo: Date | null;
}

const currentCache = new Map<string, { value: PriceSnapshot; expiresAt: number }>();

// effective_from is inclusive and effective_to is exclusive; only current-time lookups are cached.
export async function getPriceAt(modelId: string, at?: Date): Promise<PriceSnapshot> {
    const lookupAt = at ?? new Date();
    if (Number.isNaN(lookupAt.getTime())) {
        throw new AppError('Invalid pricing timestamp', 400, ErrorTypes.BAD_REQUEST);
    }

    const cached = at === undefined ? currentCache.get(modelId) : undefined;
    if (cached && cached.expiresAt > Date.now()) {
        return { ...cached.value };
    }

    const rows = await AiModelPrice.findAll({
        where: {
            model_id: modelId,
            effective_from: { [Op.lte]: lookupAt },
            [Op.or]: [
                { effective_to: null },
                { effective_to: { [Op.gt]: lookupAt } },
            ],
        },
        order: [['effective_from', 'DESC']],
        limit: 2,
    });

    if (rows.length === 0) {
        throw new AppError(`No pricing configured for model ${modelId}`, 500, ErrorTypes.INTERNAL_ERR);
    }
    if (rows.length > 1) {
        throw new AppError(`Overlapping pricing periods for model ${modelId}`, 500, ErrorTypes.INTERNAL_ERR);
    }

    const row = rows[0];
    const snapshot: PriceSnapshot = {
        modelId: row.model_id,
        inputPerMTok: row.input_per_mtok,
        outputPerMTok: row.output_per_mtok,
        effectiveFrom: row.effective_from,
        effectiveTo: row.effective_to,
    };

    if (at === undefined) {
        currentCache.set(modelId, { value: snapshot, expiresAt: Date.now() + CACHE_TTL_MS });
    }
    return { ...snapshot };
}

export function invalidatePricingCache(modelId?: string): void {
    if (modelId === undefined) {
        currentCache.clear();
        return;
    }
    currentCache.delete(modelId);
}
