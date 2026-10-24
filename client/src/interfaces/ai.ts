export interface HistoryEntry {
  role: 'user' | 'assistant';
  content: string;
}

export interface SectionItemOperation {
  operationType: 'update_item';
  sectionType: string;
  itemId: string;
  newValue: string;      // JSON-stringified updated item (without id)
  originalValue: string; // JSON-stringified original item (without id)
}

export interface SetAboutMeOperation {
  operationType: 'set_about_me';
  newValue: string;
  originalValue: string;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface AIPanelState {
  conversation: ConversationMessage[];
  history: HistoryEntry[];
  pendingOperation: SectionItemOperation | null;
  pendingTextChange: { original: string; proposed: string } | null;
  isLoading: boolean;
}

export type AiUsageNoticeLevel = 'near_limit' | 'limit_reached';

// Mirrors the server AiUsageNotice; resetsAt is null for lifetime budgets.
export interface AiUsageNotice {
  feature: 'cv_edit' | 'cv_translate';
  userType: 'guest' | 'free' | 'free_credits' | 'pro';
  period: 'daily' | 'lifetime';
  used: number;
  limit: number;
  remaining: number;
  level: AiUsageNoticeLevel;
  resetsAt: string | null;
}

export interface SectionEditResponseBody {
  operation: SectionItemOperation;
  message: string;
  history: HistoryEntry[];
  usageNotice?: AiUsageNotice | null;
}

export interface TextFieldEditResponseBody {
  operations: Array<{
    operationType: 'set_field';
    field: string;
    newValue: string;
    originalValue: string;
  }>;
  message: string;
  history: HistoryEntry[];
  usageNotice?: AiUsageNotice | null;
}

export interface AboutMeEditResponseBody {
  setAboutMe: SetAboutMeOperation;
  message: string;
  history: HistoryEntry[];
  usageNotice?: AiUsageNotice | null;
}

// ── Full CV edit ─────────────────────────────────────────────────────────────

export type CVEditOperation =
  | { operationType: 'update_item'; sectionType: string; itemId: string; newValue: string; originalValue: string }
  | { operationType: 'add_item'; sectionType: string; newValue: string }
  | { operationType: 'remove_item'; sectionType: string; itemId: string }
  | { operationType: 'set_field'; field: string; newValue: string; originalValue: string }
  | { operationType: 'set_custom_section_title'; value: string }
  | { operationType: 'set_about_me'; newValue: string; originalValue: string };

export interface CVEditResponseBody {
  operations: CVEditOperation[];
  message: string;
  history: HistoryEntry[];
  usageNotice?: AiUsageNotice | null;
}

// ── CV Translation ─────────────────────────────────────────────────────────

export type TranslateResponse =
  | { operations: CVEditOperation[]; message?: string; usageNotice?: AiUsageNotice | null }
  | { operations: []; message?: string; usageNotice?: AiUsageNotice | null }
  | { error: string };

export interface TranslateRequest {
  cvId: string;
  targetLanguage: string;
}