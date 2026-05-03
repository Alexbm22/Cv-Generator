export interface HistoryEntry {
  role: 'user' | 'assistant';
  content: string;
}

export interface PendingChange {
  field: string;
  original: string;
  proposed: string;
  changeType: 'replace' | 'append' | 'rewrite';
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface AIPanelState {
  conversation: ConversationMessage[];
  history: HistoryEntry[];
  pendingChange: PendingChange | null;
  isLoading: boolean;
}

export interface AIResponseBody {
  change: PendingChange | null;
  message: string;
  history: HistoryEntry[];
}