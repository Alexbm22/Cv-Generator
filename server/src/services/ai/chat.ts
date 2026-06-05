import { z } from 'zod';
import { openai } from '../../config/openai';
import { HistoryEntry } from '../../interfaces/ai';
import {
  aiCVEditResponseSchema,
  aiSectionEditResponseSchema,
  aiAboutMeResponseSchema,
  AiCVEditResponseOutput,
  AiSectionEditResponseOutput,
  AiAboutMeResponseOutput,
} from '../../validators/ai_validators';
import { CVSectionType } from '../../interfaces/cv';
import { SECTION_EDIT_SYSTEM_PROMPT } from '../../constants/prompts/sectionEdit';
import { CV_EDIT_SYSTEM_PROMPT } from '../../constants/prompts/cvEdit';
import { ABOUT_ME_SYSTEM_PROMPT } from '../../constants/prompts/aboutMeEdit';

export interface SectionEditCallParams {
  prompt: string;
  history: HistoryEntry[];
  sectionType: CVSectionType;
  contentId: string;
  currentContent: string;
  signal: AbortSignal;
}

export interface CVEditCallParams {
  prompt: string;
  history: HistoryEntry[];
  currentContent: string;
  signal: AbortSignal;
}

/**
 * Calls the AI to edit a single section item (e.g. a work experience entry).
 * Always returns an update_item operation for the specified item.
 */
export async function callSectionEditAI(params: SectionEditCallParams): Promise<AiSectionEditResponseOutput> {
  const { prompt, history, sectionType, contentId, currentContent, signal } = params;

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: SECTION_EDIT_SYSTEM_PROMPT },
    ...history.map((entry) => ({ role: entry.role, content: entry.content })),
    {
      role: 'user',
      content: `Section type: ${sectionType}\nItem ID: ${contentId}\n\nCurrent item:\n${currentContent}\n\nInstruction: ${prompt}`,
    },
  ];

  try {
    const completion = await openai.chat.completions.create(
      { model: 'gpt-4.1-mini', messages, temperature: 0.3, response_format: { type: 'json_object' } },
      { signal },
    );

    return parseAndValidate(completion.choices[0]?.message?.content, aiSectionEditResponseSchema);
  } catch (error) {
    console.error('Error calling section edit AI:', error);
    throw error;
  }
}

/**
 * Calls the AI to apply one or more edits across the whole CV.
 * Returns an array of typed operations (update, add, remove, set_field, etc.).
 */
export async function callCVEditAI(params: CVEditCallParams): Promise<AiCVEditResponseOutput> {
  const { prompt, history, currentContent, signal } = params;

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: CV_EDIT_SYSTEM_PROMPT },
    ...history.map((entry) => ({ role: entry.role, content: entry.content })),
    {
      role: 'user',
      content: `Current CV content:\n${currentContent}\n\nInstruction: ${prompt}`,
    },
  ];

  const completion = await openai.chat.completions.create(
    { model: 'gpt-4o-mini', messages, temperature: 0.3, response_format: { type: 'json_object' } },
    { signal },
  );

  return parseAndValidate(completion.choices[0]?.message?.content, aiCVEditResponseSchema);
}

function parseAndValidate<T>(raw: string | null | undefined, schema: z.ZodType<T>): T {
  if (!raw) throw new Error('Empty AI response');

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('AI returned non-JSON output');
  }
  
  const result = schema.safeParse(parsed);
  if (!result.success) {
    console.error('AI response validation error:', result.error);
    throw new Error(`AI response schema mismatch: ${result.error.message}`);
  }

  return result.data;
}

// ── About Me ──────────────────────────────────────────────────────────────────

export interface AboutMeEditCallParams {
  prompt: string;
  history: HistoryEntry[];
  currentText: string;
  signal: AbortSignal;
}

/**
 * Calls the AI to rewrite or improve the About Me / professional summary field.
 * Always returns a set_about_me operation with newValue and originalValue.
 */
export async function callAboutMeEditAI(params: AboutMeEditCallParams): Promise<AiAboutMeResponseOutput> {
  const { prompt, history, currentText, signal } = params;

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: ABOUT_ME_SYSTEM_PROMPT },
    ...history.map((entry) => ({ role: entry.role as 'user' | 'assistant', content: entry.content })),
    {
      role: 'user',
      content: `Current About Me:\n${currentText || '(empty)'}\n\nInstruction: ${prompt}`,
    },
  ];

  try {
    const completion = await openai.chat.completions.create(
      { model: 'gpt-4.1-mini', messages, temperature: 0.4, response_format: { type: 'json_object' } },
      { signal },
    );

    return parseAndValidate(completion.choices[0]?.message?.content, aiAboutMeResponseSchema);
  } catch (error) {
    console.error('Error calling about me edit AI:', error);
    throw error;
  }
}
