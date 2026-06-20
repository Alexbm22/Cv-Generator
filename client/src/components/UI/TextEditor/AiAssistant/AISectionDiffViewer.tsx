import { useMemo } from 'react';
import { SectionItemOperation } from '../../../../interfaces/ai';

interface AISectionDiffViewerProps {
  operation: SectionItemOperation;
  onAccept: () => void;
  onReject: () => void;
}

// ── Field display config ──────────────────────────────────────────────────────

const FIELD_LABELS: Record<string, string> = {
  jobTitle: 'Job Title',
  company: 'Company',
  startDate: 'Start Date',
  endDate: 'End Date',
  description: 'Description',
  degree: 'Degree',
  institution: 'Institution',
  name: 'Name',
  url: 'URL',
  platform: 'Platform',
  level: 'Level',
  title: 'Title',
};

const DATE_FIELDS = new Set(['startDate', 'endDate']);
const DESCRIPTION_FIELDS = new Set(['description']);

// ── Diff utilities (word-level LCS) ──────────────────────────────────────────

type DiffToken = { type: 'equal' | 'insert' | 'delete'; text: string };

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

function tokenize(text: string): string[] {
  return text.split(/\s+/).filter((t) => t.length > 0);
}

function computeWordDiff(original: string, updated: string): DiffToken[] {
  const orig = tokenize(stripHtml(original));
  const prop = tokenize(stripHtml(updated));
  const m = orig.length;
  const n = prop.length;

  const dp = new Int32Array((m + 1) * (n + 1));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i * (n + 1) + j] =
        orig[i - 1] === prop[j - 1]
          ? dp[(i - 1) * (n + 1) + (j - 1)] + 1
          : Math.max(dp[(i - 1) * (n + 1) + j], dp[i * (n + 1) + (j - 1)]);
    }
  }

  const result: DiffToken[] = [];
  const pushGrouped = (type: DiffToken['type'], word: string) => {
    const last = result[result.length - 1];
    if (last?.type === type) {
      last.text = word + ' ' + last.text;
    } else {
      result.push({ type, text: word });
    }
  };

  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && orig[i - 1] === prop[j - 1]) {
      pushGrouped('equal', orig[i - 1]); i--; j--;
    } else if (j > 0 && (i === 0 || dp[i * (n + 1) + (j - 1)] >= dp[(i - 1) * (n + 1) + j])) {
      pushGrouped('insert', prop[j - 1]); j--;
    } else {
      pushGrouped('delete', orig[i - 1]); i--;
    }
  }

  result.reverse();
  return result;
}

function formatDate(value: string): string {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short' });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DescriptionDiff({ original, updated }: { original: string; updated: string }) {
  const tokens = useMemo(() => computeWordDiff(original, updated), [original, updated]);
  return (
    <p className="text-[13px] leading-6 text-[#1d1d1f] select-none">
      {tokens.map((t, i) => {
        if (t.type === 'equal') return <span key={i}>{t.text} </span>;
        if (t.type === 'insert')
          return (
            <mark key={i} className="bg-[#bbf7d0] text-[#15803d] rounded px-1 py-0.5 mx-px not-italic font-medium">
              {t.text}{' '}
            </mark>
          );
        return (
          <mark key={i} className="bg-[#fee2e2] text-[#dc2626] line-through rounded px-1 py-0.5 mx-px not-italic font-medium">
            {t.text}{' '}
          </mark>
        );
      })}
    </p>
  );
}

function PlainDiff({ original, updated }: { original: string; updated: string }) {
  return (
    <div className="flex items-center gap-2 text-[13px] flex-wrap">
      <span className="line-through text-[#dc2626] bg-[#fee2e2] rounded px-1.5 py-0.5">
        {original || '—'}
      </span>
      <span className="text-[#6e6e73]">→</span>
      <span className="text-[#15803d] bg-[#bbf7d0] rounded px-1.5 py-0.5 font-medium">
        {updated || '—'}
      </span>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

interface ChangedField { key: string; original: string; updated: string }

function getChangedFields(
  original: Record<string, unknown>,
  updated: Record<string, unknown>,
): ChangedField[] {
  const changed: ChangedField[] = [];
  for (const key of Object.keys(updated)) {
    if (key === 'id') continue;
    const origVal = String(original[key] ?? '');
    const newVal = String(updated[key] ?? '');
    if (origVal !== newVal) changed.push({ key, original: origVal, updated: newVal });
  }
  return changed;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AISectionDiffViewer({ operation, onAccept, onReject }: AISectionDiffViewerProps) {
  const changedFields = useMemo(() => {
    try {
      const original = JSON.parse(operation.originalValue) as Record<string, unknown>;
      const updated = JSON.parse(operation.newValue) as Record<string, unknown>;
      return getChangedFields(original, updated);
    } catch {
      return [];
    }
  }, [operation.originalValue, operation.newValue]);

  return (
    <div className="p-3 pb-0 mb-4">
      <div className="border-b border-[#e5e5ea] bg-[#f7f7fa] rounded-2xl shadow-stone-50">

        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-2 pr-3 border-b border-[#e5e5ea]">
          <span className="text-[11px] font-semibold text-[#1d1d1f] tracking-wide flex-1">
            Proposed changes
          </span>
          <button
            type="button"
            onClick={onReject}
            className="cursor-pointer px-3 py-1 rounded-full text-[11px] font-medium text-red-500 bg-transparent hover:bg-[#ffe5e5] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="cursor-pointer px-3 py-1 rounded-full text-[11px] font-semibold bg-[#0071e3] text-white hover:bg-[#0060c7] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-1"
          >
            Accept
          </button>
        </div>

        {/* Field diffs */}
        <div className="px-4 py-3 flex flex-col gap-4 max-h-[300px] overflow-y-auto">
          {changedFields.length === 0 ? (
            <p className="text-[13px] text-[#6e6e73]">No changes proposed.</p>
          ) : (
            changedFields.map(({ key, original, updated }) => (
              <div key={key}>
                <span className="block text-[10px] font-semibold text-[#6e6e73] tracking-widest uppercase mb-1">
                  {FIELD_LABELS[key] ?? key}
                </span>
                {DESCRIPTION_FIELDS.has(key) ? (
                  <DescriptionDiff original={original} updated={updated} />
                ) : DATE_FIELDS.has(key) ? (
                  <PlainDiff original={formatDate(original)} updated={formatDate(updated)} />
                ) : (
                  <PlainDiff original={original} updated={updated} />
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
