import { AI_MODEL_CONFIG, AI_PROVIDER } from '@/config/ai';
import { ModelSelection } from '../pipeline/types';
import { AiService } from './AiService';
import { OpenAiAdapter } from './providers/openai/OpenAiAdapter';

export type { AiService, AiMessage, AiCompletionRequest, AiCompletionResult } from './AiService';

export const aiService: AiService = new OpenAiAdapter();

// For internal purposes that have no user-selected model.
export function modelFor(purpose: keyof typeof AI_MODEL_CONFIG): ModelSelection {
  const entry: { modelId: string; temperature: number; maxOutputTokens?: number } = AI_MODEL_CONFIG[purpose];
  return {
    provider: AI_PROVIDER,
    modelId: entry.modelId,
    params: { temperature: entry.temperature, maxOutputTokens: entry.maxOutputTokens },
    reason: 'config',
  };
}

// Model chosen by the usage pipeline for the user; never read from config.
export function userModelFor(modelId: string, temperature: number): ModelSelection {
  return {
    provider: AI_PROVIDER,
    modelId,
    params: { temperature },
    reason: 'tier',
  };
}
