import { AI_MODEL_CONFIG, AI_PROVIDER } from '@/config/ai';
import { AiPurpose, ModelSelection } from '../pipeline/types';
import { AiService } from './AiService';
import { OpenAiAdapter } from './providers/openai/OpenAiAdapter';

export type { AiService, AiMessage, AiCompletionRequest, AiCompletionResult } from './AiService';

export const aiService: AiService = new OpenAiAdapter();

// Stub for model selection (stage 4): returns the configured model for a purpose.
export function modelFor(purpose: AiPurpose): ModelSelection {
  const entry: { modelId: string; temperature: number; maxOutputTokens?: number } = AI_MODEL_CONFIG[purpose];
  return {
    provider: AI_PROVIDER,
    modelId: entry.modelId,
    params: { temperature: entry.temperature, maxOutputTokens: entry.maxOutputTokens },
    reason: 'config',
  };
}
