import { useMemo } from 'react';
import { PendingChange } from '../../../../interfaces/ai';

interface AIDiffViewerProps {
  pendingChange: PendingChange;
  onAccept: () => void;
  onReject: () => void;
}

type DiffToken =
  | { type: 'equal'; text: string }
  | { type: 'insert'; text: string }
  | { type: 'delete'; text: string };

/** Strip HTML tags to plain text for safe diffing and display. */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

/** Split into words (whitespace-separated). Filters empty strings. */
function tokenize(text: string): string[] {
  return text.split(/\s+/).filter((t) => t.length > 0);
}

/**
 * LCS-based word-level diff.
 * Groups consecutive same-type tokens inline during backtracking.
 * Short-circuits for the `append` case (no LCS needed).
 */
function computeDiff(original: string, proposed: string, isAppend: boolean): DiffToken[] {
  const prop = tokenize(stripHtml(proposed));

  // Short-circuit: every proposed word is an insert — skip LCS entirely
  if (isAppend) {
    return prop.length ? [{ type: 'insert', text: prop.join(' ') }] : [];
  }

  const orig = tokenize(stripHtml(original));
  const m = orig.length;
  const n = prop.length;

  // Flat Int32Array LCS table for performance
  const dp = new Int32Array((m + 1) * (n + 1));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i * (n + 1) + j] =
        orig[i - 1] === prop[j - 1]
          ? dp[(i - 1) * (n + 1) + (j - 1)] + 1
          : Math.max(dp[(i - 1) * (n + 1) + j], dp[i * (n + 1) + (j - 1)]);
    }
  }

  // Backtrack using push+reverse (O(n)) instead of unshift (O(n²)).
  // Consecutive same-type tokens are merged inline — no second pass needed.
  const result: DiffToken[] = [];

  const pushGrouped = (type: DiffToken['type'], word: string) => {
    const last = result[result.length - 1];
    if (last?.type === type) {
      // Prepend word (we're building in reverse order)
      last.text = word + ' ' + last.text;
    } else {
      result.push({ type, text: word });
    }
  };

  let i = m;
  let j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && orig[i - 1] === prop[j - 1]) {
      pushGrouped('equal', orig[i - 1]);
      i--;
      j--;
    } else if (
      j > 0 &&
      (i === 0 || dp[i * (n + 1) + (j - 1)] >= dp[(i - 1) * (n + 1) + j])
    ) {
      pushGrouped('insert', prop[j - 1]);
      j--;
    } else {
      pushGrouped('delete', orig[i - 1]);
      i--;
    }
  }

  result.reverse();
  return result;
}

/**
 * Inline diff viewer — shows only the proposed text with word-level
 * highlighting: green for additions, red strikethrough for removals.
 * Positioned right below the text editor.
 */
export default function AIDiffViewer({ pendingChange, onAccept, onReject }: AIDiffViewerProps) {
  const { original, proposed, changeType } = pendingChange;

  const diffTokens = useMemo(
    () => computeDiff(original, proposed, changeType === 'append'),
    [original, proposed, changeType],
  );

  return (
    <div className='p-3 pb-0 mb-4'>
        <div className="border-b border-[#e5e5ea] bg-[#f7f7fa] rounded-2xl shadow-stone-50">
        {/* Header row */}
        <div className="flex items-center gap-2 px-4 py-2 pr-3 border-b border-[#e5e5ea]">
            <span className="text-[11px] font-semibold text-[#1d1d1f] tracking-wide flex-1">
                Proposed change
            </span>
            <button
            type="button"
            onClick={onReject}
            className={[
                'cursor-pointer px-3 py-1 rounded-full text-[11px] font-medium',
                'text-red-500 bg-transparent',
                'hover:bg-[#ffe5e5] transition-colors duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1',
            ].join(' ')}
            >
                <span>
                    Reject  
                </span>
            </button>
            <button
            type="button"
            onClick={onAccept}
            className={[
                'cursor-pointer px-3 py-1 rounded-full text-[11px] font-semibold',
                'bg-[#0071e3] text-white',
                'hover:bg-[#0060c7] transition-colors duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-1',
            ].join(' ')}
            >
                <span>
                    Accept
                </span>
            </button>
        </div>

        {/* Inline diff body */}
        <span>
            <p className="px-4 py-3 text-[13px] leading-6 text-[#1d1d1f] max-h-[240px] overflow-y-auto select-none">
                {diffTokens.map((token, idx) => {
                if (token.type === 'equal') {
                    return <span key={idx}>{token.text} </span>;
                }
                if (token.type === 'insert') {
                    return (
                    <mark
                        key={idx}
                        className="bg-[#bbf7d0] text-[#15803d] rounded px-1.5 py-0.5 mx-px not-italic font-medium"
                    >
                        {token.text}{' '}
                    </mark>
                    );
                }
                // delete
                return (
                    <mark
                    key={idx}
                    className="bg-[#fee2e2] text-[#dc2626] rounded px-1.5 py-0.5 mx-px not-italic font-medium"
                    >
                    {token.text}{' '}
                    </mark>
                );
                })}
            </p>
        </span>
        </div>
    </div>
  );
}
