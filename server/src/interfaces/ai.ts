export interface HistoryEntry {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export type StreamEvent =
  | { type: 'message'; content: string }
  | { type: 'history_update'; history: HistoryEntry[] }
  | { type: 'done' }
  | { type: 'error'; message: string };
