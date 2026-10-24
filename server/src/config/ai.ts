export const AI_PROVIDER = 'openai';

// Models for internal purposes only. CV calls use the model chosen by the usage pipeline.
export const AI_MODEL_CONFIG = {
  history_summary: { modelId: 'gpt-4o-mini', temperature: 0 },
  language_detection: { modelId: 'gpt-4o-mini', temperature: 0.3, maxOutputTokens: 10 },
} as const;
