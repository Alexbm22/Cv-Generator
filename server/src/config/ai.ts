export const AI_PROVIDER = 'openai';

// Model and sampling settings per purpose. Model ids are read only from here.
export const AI_MODEL_CONFIG = {
  cv_edit: { modelId: 'gpt-6-luna', temperature: 1 },
  cv_translate: { modelId: 'gpt-4o', temperature: 0 },
  history_summary: { modelId: 'gpt-4o-mini', temperature: 0 },
  language_detection: { modelId: 'gpt-4o-mini', temperature: 0.3, maxOutputTokens: 10 },
} as const;
