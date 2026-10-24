import { z } from 'zod';
import { aiService, userModelFor } from './core';
import type { AiCompletionResult, AiMessage } from './core';
import { HistoryEntry } from '../../interfaces/ai';
import {
  aiCVEditResponseSchema,
  aiSectionEditResponseSchema,
  aiAboutMeResponseSchema,
  AiCVEditResponseOutput,
  AiSectionEditResponseOutput,
  AiAboutMeResponseOutput,
  CVEditOperation,
} from '../../validators/ai_validators';
import { CVSectionType } from '../../interfaces/cv';
import { SECTION_EDIT_SYSTEM_PROMPT } from '../../constants/prompts/sectionEdit';
import { CV_EDIT_SYSTEM_PROMPT } from '../../constants/prompts/cvEdit';
import { ABOUT_ME_SYSTEM_PROMPT } from '../../constants/prompts/aboutMeEdit';
import { TRANSLATE_CV_SYSTEM_PROMPT } from '../../constants/prompts/translateCV';

// modelId and temperature are resolved by the usage pipeline; onCompletion reports usage as soon as the provider call returns.
export interface AiCallOptions {
  modelId: string;
  temperature: number;
  signal: AbortSignal;
  onCompletion: (usage: AiCompletionResult['usage']) => void;
}

async function completeJson(
  purpose: 'cv_edit' | 'cv_translate',
  messages: AiMessage[],
  call: AiCallOptions,
): Promise<AiCompletionResult> {
  const completion = await aiService.complete({
    purpose,
    messages,
    model: userModelFor(call.modelId, call.temperature),
    responseFormat: 'json',
    signal: call.signal,
  });
  call.onCompletion(completion.usage);
  return completion;
}

export interface SectionEditCallParams extends AiCallOptions {
  prompt: string;
  history: HistoryEntry[];
  sectionType: CVSectionType;
  contentId: string;
  currentContent: string;
  pendingOperation?: CVEditOperation;
  jobData?: { jobTitle?: string; jobDescription?: string; companyName?: string };
}

export interface CVEditCallParams extends AiCallOptions {
  prompt: string;
  history: HistoryEntry[];
  pendingOperations?: CVEditOperation[];
  currentContent: string;
  jobData?: { jobTitle?: string; jobDescription?: string; companyName?: string };
}

/**
 * Calls the AI to edit a single section item (e.g. a work experience entry).
 * Always returns an update_item operation for the specified item.
 */
export async function callSectionEditAI(params: SectionEditCallParams): Promise<AiSectionEditResponseOutput> {
  const { prompt, history, sectionType, contentId, currentContent, pendingOperation, jobData } = params;

  const JobDataString = jobData ? `\n<job_posting>
    Job Title: ${jobData.jobTitle}
    Company: ${jobData.companyName}
    Description: ${jobData.jobDescription}
    </job_posting>\n
    This is the job I'm targeting. When I ask you to update my CV, use this posting to identify key skills and keywords, and tailor accordingly — without fabricating experience I don't have.`
    : '';
  const pendingOpString = pendingOperation ? `\n\nPlease give me a response based on the pending operation: ${JSON.stringify(pendingOperation)}` : '';

  let userMessage = `Section type: ${sectionType}\nItem ID: ${contentId}\n\nCurrent item:\n${currentContent}${JobDataString}${pendingOpString}\n\nInstruction: ${prompt}`;

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: SECTION_EDIT_SYSTEM_PROMPT},
    ...history.map((entry) => ({ role: entry.role, content: entry.content })),
    {
      role: 'user',
      content: userMessage,
    },
  ];

  try {
    const completion = await completeJson('cv_edit', messages, params);

    const response = parseAndValidate(completion.content, aiSectionEditResponseSchema);
    return {
      ...response,
      ItemEditOperation: sanitizeSkillLevelOperation(response.ItemEditOperation),
    };
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
  const { prompt, history, pendingOperations, currentContent, jobData } = params;

  const JobDataString = jobData ? `\n\n<job_posting>
      Job Title: ${jobData.jobTitle}
      Company: ${jobData.companyName}
      Description: ${jobData.jobDescription}
      </job_posting>\nThis is the job I'm targeting. When I ask you to update my CV, use this posting to identify key skills and keywords, and tailor accordingly — without fabricating experience I don't have.` 
    : '';
  const pendingOpsString = pendingOperations && pendingOperations.length > 0 ? `\n\nPlease give me a response based on the pending operations: ${JSON.stringify(pendingOperations)}` : '';
  
  let userMessage = `Current CV content:\n${currentContent}${JobDataString}${pendingOpsString}\n\nInstruction: ${prompt}`;

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: CV_EDIT_SYSTEM_PROMPT(pendingOperations) },
    ...history.map((entry) => ({ role: entry.role, content: entry.content })),
    {
      role: 'user',
      content: userMessage,
    },
  ];

  const completion = await completeJson('cv_edit', messages, params);

  const response = parseAndValidate(completion.content, aiCVEditResponseSchema);
  return {
    ...response,
    CVEditOperations: response.CVEditOperations.map(sanitizeSkillLevelOperation),
  };
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

function normalizeLevel(value: unknown, sectionType: 'skills' | 'languages'): number | null | undefined {
  if (value === null) return null;

  const maxLevel = sectionType === 'skills' ? 4 : 6;
  const numericLevel = typeof value === 'number'
    ? value
    : typeof value === 'string' && value.trim() !== ''
      ? Number(value.trim())
      : NaN;
  if (Number.isInteger(numericLevel) && numericLevel >= 1 && numericLevel <= maxLevel) {
    return numericLevel;
  }

  if (typeof value !== 'string') return undefined;
  const label = value.trim().toLowerCase().replace(/\s+/g, ' ');
  const labels: Record<'skills' | 'languages', Record<string, number>> = {
    skills: { beginner: 1, intermediate: 2, advanced: 3, expert: 4 },
    languages: {
      a1: 1, 'a1 - beginner': 1, beginner: 1,
      a2: 2, 'a2 - elementary': 2, elementary: 2,
      b1: 3, 'b1 - intermediate': 3, intermediate: 3,
      b2: 4, 'b2 - upper intermediate': 4, 'upper intermediate': 4,
      c1: 5, 'c1 - advanced': 5, advanced: 5,
      c2: 6, 'c2 - proficient': 6, proficient: 6,
    },
  };
  return labels[sectionType][label];
}

const DEFAULT_LEVEL: Record<'skills' | 'languages', number> = { skills: 2, languages: 3 };

function sanitizeSkillLevelOperation<T extends { operationType: string }>(operation: T): T {
  if (operation.operationType !== 'add_item' && operation.operationType !== 'update_item') return operation;
  if (!('sectionType' in operation) || !('newValue' in operation)) return operation;
  if (operation.sectionType !== 'skills' && operation.sectionType !== 'languages') return operation;
  if (typeof operation.newValue !== 'string') return operation;

  let item: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(operation.newValue);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return operation;
    item = parsed as Record<string, unknown>;
  } catch {
    return operation;
  }

  const level = normalizeLevel(item.level, operation.sectionType);
  if (operation.operationType === 'add_item') {
    item.level = level ?? DEFAULT_LEVEL[operation.sectionType];
  } else if (Object.prototype.hasOwnProperty.call(item, 'level') && level !== undefined) {
    item.level = level;
  } else if (Object.prototype.hasOwnProperty.call(item, 'level')) {
    delete item.level;
  }

  return { ...operation, newValue: JSON.stringify(item) } as T;
}

// ── About Me ──────────────────────────────────────────────────────────────────

export interface AboutMeEditCallParams extends AiCallOptions {
  prompt: string;
  history: HistoryEntry[];
  currentText: string;
  pendingTextChange?: { original: string; proposed: string };
  jobData?: { jobTitle?: string; jobDescription?: string; companyName?: string };
}

/**
 * Calls the AI to rewrite or improve the About Me / professional summary field.
 * Always returns a set_about_me operation with newValue and originalValue.
 */
export async function callAboutMeEditAI(params: AboutMeEditCallParams): Promise<AiAboutMeResponseOutput> {
  const { prompt, history, currentText, pendingTextChange, jobData } = params;

  const JobDataString = jobData ? `\n<job_posting>\n    Job Title: ${jobData.jobTitle}\n    Company: ${jobData.companyName}\n    Description: ${jobData.jobDescription}\n    </job_posting>\n    This is the job I'm targeting. When I ask you to update my CV, use this posting to identify key skills and keywords, and tailor accordingly — without fabricating experience I don't have.`
    : '';
  const pendingChangeString = pendingTextChange ? `\n\nPlease give me a response based on the pending text change: from "${pendingTextChange.original}" to "${pendingTextChange.proposed}"` : '';

  let userMessage = `Current About Me text:\n${currentText || '(empty)'}${JobDataString}${pendingChangeString}\n\nInstruction: ${prompt}`;

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: ABOUT_ME_SYSTEM_PROMPT },
    ...history.map((entry) => ({ role: entry.role as 'user' | 'assistant', content: entry.content })),
    {
      role: 'user',
      content: userMessage,
    },
  ];

  try {
    const completion = await completeJson('cv_edit', messages, params);

    return parseAndValidate(completion.content, aiAboutMeResponseSchema);
  } catch (error) {
    console.error('Error calling about me edit AI:', error);
    throw error;
  }
}

// ── CV Translation ────────────────────────────────────────────────────────────

export interface TranslateCVCallParams extends AiCallOptions {
  currentContent: string;
  targetLanguage: string;
}

/**
 * Calls the AI to translate all human-readable CV fields into the target language.
 * Returns an array of typed operations covering every translatable field.
 */
export async function callTranslateCVAI(params: TranslateCVCallParams): Promise<AiCVEditResponseOutput> {
  const { currentContent, targetLanguage } = params;

  const userMessage = `Translate the following CV content into ${targetLanguage}.\n\nCV content:\n${currentContent}`;

  const messages: Array<{ role: 'system' | 'user'; content: string }> = [
    { role: 'system', content: TRANSLATE_CV_SYSTEM_PROMPT(targetLanguage) },
    { role: 'user', content: userMessage },
  ];

  try {
    const completion = await completeJson('cv_translate', messages, params);

    const response = parseAndValidate(completion.content, aiCVEditResponseSchema);
    return {
      ...response,
      CVEditOperations: response.CVEditOperations.map(sanitizeSkillLevelOperation),
    };
  } catch (error) {
    console.error('Error calling translate CV AI:', error);
    throw error;
  }
}
