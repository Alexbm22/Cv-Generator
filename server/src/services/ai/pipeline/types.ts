import { AI_MODEL_CONFIG } from '@/config/ai';

export type AiPurpose = 'cv_edit' | 'cv_translate' | keyof typeof AI_MODEL_CONFIG;

export interface ModelSelection {
  provider: string;
  modelId: string;
  params: { temperature?: number; maxOutputTokens?: number };
  reason: string;
}
