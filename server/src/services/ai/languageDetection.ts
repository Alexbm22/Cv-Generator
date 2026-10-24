import { aiService, modelFor } from './core';

type SupportedLanguageCode = 'en' | 'fr' | 'es' | 'de' | 'it' | 'pt' | 'ro' | 'el' | 'ru';

const SUPPORTED_CODES = new Set<SupportedLanguageCode>(['en', 'fr', 'es', 'de', 'it', 'pt', 'ro', 'el', 'ru']);

const SYSTEM_PROMPT = `You are a language detection assistant. Given a text, identify its language and respond with ONLY the ISO 639-1 language code (e.g. "en", "fr", "de"). 
Supported languages and their codes: English (en), French (fr), Spanish (es), German (de), Italian (it), Portuguese (pt), Romanian (ro), Greek (el), Russian (ru).
If the language is not one of the supported ones, or you are not confident, respond with exactly: null`;

export async function detectLanguage(text: string): Promise<SupportedLanguageCode | null> {
  if (!text || text.trim().length === 0) return null;

  const completion = await aiService.complete({
    purpose: 'language_detection',
    model: modelFor('language_detection'),
    responseFormat: 'text',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: text },
    ],
  });

  const raw = completion.content?.trim().toLowerCase() ?? '';

  if (raw === 'null' || raw === '') return null;

  return SUPPORTED_CODES.has(raw as SupportedLanguageCode) ? (raw as SupportedLanguageCode) : null;
}

