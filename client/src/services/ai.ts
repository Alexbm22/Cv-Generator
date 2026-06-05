import { apiService } from './api';
import { CVEditResponseBody, HistoryEntry, SectionEditResponseBody, TextFieldEditResponseBody, AboutMeEditResponseBody } from '../interfaces/ai';
import axios from 'axios';

export interface SectionAIChatParams {
  prompt: string;
  history: HistoryEntry[];
  sectionType: string;
  contentId: string;
  currentItem: Record<string, unknown>;
  signal: AbortSignal;
}

export interface TextFieldAIChatParams {
  prompt: string;
  history: HistoryEntry[];
  sectionType: string; // e.g. 'aboutMe'
  currentText: string;
  signal: AbortSignal;
}

/**
 * Sends a section item edit request to the AI endpoint.
 * Strips the `id` field from content before sending — the backend schema does not include it.
 * Returns the structured response: { operation, message, history }.
 */
export async function sendSectionEditMessage(params: SectionAIChatParams): Promise<SectionEditResponseBody> {
  const { prompt, history, sectionType, contentId, currentItem, signal } = params;

  // Strip `id` from content: the backend sectionData schema does not include it.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, ...content } = currentItem as Record<string, unknown> & { id?: unknown };

  try {
    return await apiService.post<SectionEditResponseBody>(
      '/ai/chat',
      {
        prompt,
        history,
        sectionData: { sectionType, contentId, content },
      },
      { signal, timeout: 60000 },
    );
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const message: string =
        err.response?.data?.message ?? `AI request failed (${err.response?.status ?? 'unknown'})`;
      throw new Error(message);
    }
    throw err;
  }
}

/**
 * Sends a plain text field edit request (e.g. aboutMe) where there is no item ID.
 * The backend uses the CV edit path and returns a set_field operation.
 * Returns the structured response: { operations, message, history }.
 */
export async function sendTextFieldEditMessage(params: TextFieldAIChatParams): Promise<TextFieldEditResponseBody> {
  const { prompt, history, sectionType, currentText, signal } = params;

  try {
    return await apiService.post<TextFieldEditResponseBody>(
      '/ai/chat',
      {
        prompt,
        history,
        sectionData: { sectionType, content: currentText },
      },
      { signal, timeout: 60000 },
    );
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const message: string =
        err.response?.data?.message ?? `AI request failed (${err.response?.status ?? 'unknown'})`;
      throw new Error(message);
    }
    throw err;
  }
}

export interface CVEditAIChatParams {
  prompt: string;
  history: HistoryEntry[];
  signal: AbortSignal;
  /** Pass for authenticated users — backend fetches CV content. */
  cvId?: string;
  /** Pass for guests — full CV data sent directly. */
  cvData?: unknown;
}

/**
 * Sends a whole-CV edit request to the AI endpoint.
 * For authenticated users: sends CVId and lets the backend fetch the content.
 * For guests: sends the full CV data object directly.
 * Returns a list of typed operations covering all change types.
 */
export async function sendCVEditMessage(params: CVEditAIChatParams): Promise<CVEditResponseBody> {
  const { prompt, history, signal, cvId, cvData } = params;

  try {
    if (cvId) {
      return await apiService.post<CVEditResponseBody>(
        '/protected/ai/chat',
        { prompt, history, CVId: cvId },
        { signal, timeout: 90000 },
      );
    }

    return await apiService.post<CVEditResponseBody>(
      '/ai/chat',
      { prompt, history, cvData },
      { signal, timeout: 90000 },
    );
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const message: string =
        err.response?.data?.message ?? `AI request failed (${err.response?.status ?? 'unknown'})`;
      throw new Error(message);
    }
    throw err;
  }
}

export interface AboutMeAIChatParams {
  prompt: string;
  history: HistoryEntry[];
  signal: AbortSignal;
  /** Pass for authenticated users — backend fetches the CV's aboutMe field. */
  cvId?: string;
  /** Pass for guests — current aboutMe HTML text sent directly. */
  currentText?: string;
}

/**
 * Sends an About Me edit request to the dedicated AI endpoint.
 * For authenticated users: sends CVId and lets the backend fetch the field.
 * For guests: sends currentText directly.
 * Returns a set_about_me operation with newValue and originalValue.
 */
export async function sendAboutMeEditMessage(params: AboutMeAIChatParams): Promise<AboutMeEditResponseBody> {
  const { prompt, history, signal, cvId, currentText } = params;

  try {
    if (cvId) {
      return await apiService.post<AboutMeEditResponseBody>(
        '/protected/ai/about-me',
        { prompt, history, CVId: cvId },
        { signal, timeout: 60000 },
      );
    }

    return await apiService.post<AboutMeEditResponseBody>(
      '/ai/about-me',
      { prompt, history, currentText: currentText ?? '' },
      { signal, timeout: 60000 },
    );
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const message: string =
        err.response?.data?.message ?? `AI request failed (${err.response?.status ?? 'unknown'})`;
      throw new Error(message);
    }
    throw err;
  }
}
