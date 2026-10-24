import type { EstimatorConfig } from '../services/ai/AiCreditsEstimator';

// All values below are placeholders. TODO: de calibrat pe date reale.
export const defaultConfig: EstimatorConfig = {
  // TODO: de calibrat pe date reale (valoarea unui credit in USD)
  creditValueUsd: 0.01,

  // TODO: de calibrat pe date reale (raport caractere/token pentru limba folosita)
  charsPerToken: 3.5,

  // TODO: de calibrat pe date reale (marja de siguranta peste estimare)
  safetyMargin: 1.2,

  // TODO: de calibrat pe date reale (lungimea system prompt-ului in tokeni)
  systemPromptTokens: {
    cv_edit: 2500,
    cv_translate: 1000,
  },

  // TODO: de calibrat pe date reale (intervalul de tokeni de output)
  output: {
    cv_edit: { minTokens: 300, maxTokens: 4000 },
    cv_translate: { minTokens: 300, maxTokens: 8000 },
  },

  difficulty: {
    // TODO: de calibrat pe date reale (lungimea la care scorul saturează)
    promptCharsSaturation: 1500,
    dataCharsSaturation: 20000,

    // TODO: de calibrat pe date reale (ponderile promptului vs. datelor; suma = 1)
    weights: {
      cv_edit: { prompt: 0.3, data: 0.7 },
      cv_translate: { prompt: 0.2, data: 0.8 },
    },
  },
};
