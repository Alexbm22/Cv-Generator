import { getEncoding, Tiktoken } from 'js-tiktoken';
import { openai } from '../../config/openai';
import { HistoryEntry } from '../../interfaces/ai';


const TOKEN_BUDGET = 600;
const NEAR_LIMIT_RATIO = 0.75;

let _encoder: Tiktoken | null = null;

function getEncoder(): Tiktoken {
  if (!_encoder) {
    _encoder = getEncoding('o200k_base');
  }
  return _encoder;
}

function countTokensForEntry(entry: HistoryEntry): number {
  return getEncoder().encode(entry.content).length;
}

function totalHistoryTokens(history: HistoryEntry[]): number {
  return history.reduce((sum, entry) => sum + countTokensForEntry(entry), 0);
}


async function summarizeEntries(entries: HistoryEntry[]): Promise<HistoryEntry> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Summarize this conversation history concisely. Output a single paragraph (max 200 tokens) covering: what the user is trying to accomplish, key facts/decisions established, current state of the task',
        },
        {
          role: 'user',
          content: `Here is the conversation history to summarize:\n\n${entries
            .map((e) => `${e.role.toUpperCase()}: ${e.content.replace(/\n/g, ' ')}`)
            .join('\n\n')}`,
        },
      ],
      temperature: 0,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response?.trim()) return entries.at(-1) ?? entries[0];

    return { role: 'system', content: response.trim() };
  } catch {
    // Fallback to original entry on any error
  }

  return entries.at(-1) ?? entries[0];
}

export interface OptimizeResult {
  optimized: HistoryEntry[];
  wasModified: boolean;
}


export async function optimizeHistory(history: HistoryEntry[]): Promise<OptimizeResult> {
  if (history.length === 0) {
    return { optimized: history, wasModified: false };
  }

  const totalTokens = totalHistoryTokens(history);

  if (totalTokens <= TOKEN_BUDGET * NEAR_LIMIT_RATIO) {
    return { optimized: history, wasModified: false };
  }

  if (totalTokens <= TOKEN_BUDGET) {
    const mid = Math.floor(history.length / 2);
    const summarized = await summarizeEntries(history.slice(0, mid));
    return {
      optimized: [summarized, ...history.slice(mid)],
      wasModified: true,
    };
  }

  const keepCount = Math.min(2, history.length);
  const toSummarize = history.slice(0, history.length - keepCount);
  const summarized = await summarizeEntries(toSummarize);
  return {
    optimized: [summarized, ...history.slice(history.length - keepCount)],
    wasModified: true,
  };
}
