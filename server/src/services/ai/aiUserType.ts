import type { AiUserType } from '@/ai/limits.service';
import type { Actor } from '@/interfaces/actor';
import { CreditsService } from '@/services/credits';
import { SubscriptionService } from '@/services/subscriptions';

export const resolveAiUserType = async (actor: Actor): Promise<AiUserType> => {
    if (actor.type === 'guest') return 'guest';
    if (await SubscriptionService.getEntitledSubscription(actor.id)) return 'pro';
    if ((await CreditsService.getUserCredits(actor.id)) > 0) return 'free_credits';
    return 'free';
};
