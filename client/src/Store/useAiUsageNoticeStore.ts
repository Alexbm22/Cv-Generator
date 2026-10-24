import { create } from 'zustand';
import type { AiUsageNotice, AiUsageNoticeLevel } from '../interfaces/ai';

const STORAGE_KEY = 'ai-usage-notices-shown';

type ShownNotices = Record<string, AiUsageNoticeLevel>;

const readShown = (): ShownNotices => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as ShownNotices;
  } catch {
    return {};
  }
};

// Daily budgets get a new key each UTC day because resetsAt changes; lifetime budgets never reset.
const periodKey = (notice: AiUsageNotice): string =>
  `${notice.feature}|${notice.userType}|${notice.resetsAt ?? 'lifetime'}`;

export const formatLimitChatMessage = (notice: AiUsageNotice): string => {
  const resetText = notice.resetsAt
    ? ` It resets at ${new Date(notice.resetsAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}.`
    : '';
  return `You have reached your AI usage limit.${resetText}`;
};

interface AiUsageNoticeStore {
  notice: AiUsageNotice | null;
  show: (notice: AiUsageNotice) => void;
  dismiss: () => void;
}

export const useAiUsageNoticeStore = create<AiUsageNoticeStore>()((set) => ({
  notice: null,

  show: (notice) => {
    const shown = readShown();
    const key = periodKey(notice);
    // Warnings show once per period; limit_reached always shows.
    if (notice.level === 'near_limit' && shown[key]) return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...shown, [key]: notice.level }));
    set({ notice });
  },

  dismiss: () => set({ notice: null }),
}));
