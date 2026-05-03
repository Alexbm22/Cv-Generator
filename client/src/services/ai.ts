import { apiService } from './api';
import { HistoryEntry, AIResponseBody } from '../interfaces/ai';
import axios from 'axios';

export interface AIChatParams {
  prompt: string;
  history: HistoryEntry[];
  sectionType: string;
  currentContent: string;
  signal: AbortSignal;
}

/**
 * Sends a single POST request to the AI chat endpoint and returns the
 * structured JSON response: { change, message, history }.
 */
export async function sendAIMessage(params: AIChatParams): Promise<AIResponseBody> {
  const { prompt, history, sectionType, currentContent, signal } = params;

  try {
    return await apiService.post<AIResponseBody>(
      '/ai/chat',
      { prompt, history, sectionType, currentContent },
      { signal },
    );
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const message: string = err.response?.data?.message ?? `AI request failed (${err.response?.status ?? 'unknown'})`;
      throw new Error(message);
    }
    throw err;
  }
}
