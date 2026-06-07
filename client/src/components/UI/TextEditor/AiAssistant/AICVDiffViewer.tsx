import { useMemo } from 'react';
import { CVEditOperation } from '../../../../interfaces/ai';

// ── Types extracted from the union ───────────────────────────────────────────

type UpdateItemOp = Extract<CVEditOperation, { operationType: 'update_item' }>;
type AddItemOp    = Extract<CVEditOperation, { operationType: 'add_item' }>;
type RemoveItemOp = Extract<CVEditOperation, { operationType: 'remove_item' }>;
type SetFieldOp   = Extract<CVEditOperation, { operationType: 'set_field' }>;
type SetTitleOp   = Extract<CVEditOperation, { operationType: 'set_custom_section_title' }>;
type SetAboutMeOp = Extract<CVEditOperation, { operationType: 'set_about_me' }>;

// ── Config ────────────────────────────────────────────────────────────────────

const SECTION_LABELS: Record<string, string> = {
  workExperience:  'Work Experience',
  education:       'Education',
  projects:        'Projects',
  customSections:  'Custom Sections',
  skills:          'Skills',
  languages:       'Languages',
  socialLinks:     'Social Links',
};

const FIELD_LABELS: Record<string, string> = {
  firstName:   'First Name',
  lastName:    'Last Name',
  email:       'Email',
  phoneNumber: 'Phone',
  address:     'Address',
  jobTitle:    'Job Title',
  aboutMe:     'About Me',
  birthDate:   'Birth Date',
  degree:      'Degree',
  institution: 'Institution',
  company:     'Company',
  startDate:   'Start Date',
  endDate:     'End Date',
  description: 'Description',
  name:        'Name',
  url:         'URL',
  platform:    'Platform',
  level:       'Level',
  title:       'Title',
};

const DATE_FIELDS        = new Set(['startDate', 'endDate', 'birthDate']);
const DESCRIPTION_FIELDS = new Set(['description', 'aboutMe']);

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

// ── Primitive diff renderers ──────────────────────────────────────────────────

function WordDiff({ original, updated }: { original: string; updated: string }) {
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

function getItemSummary(sectionType: string, item: Record<string, unknown>): string {
  switch (sectionType) {
    case 'workExperience': return `${item.jobTitle || 'Untitled'} at ${item.company || 'Unknown'}`;
    case 'education':      return `${item.degree || 'Untitled'} at ${item.institution || 'Unknown'}`;
    case 'projects':       return String(item.name || 'Unnamed Project');
    case 'skills':         return String(item.name || 'Unnamed Skill');
    case 'languages':      return String(item.name || 'Unnamed Language');
    case 'socialLinks':    return `${item.platform || 'Unknown'} – ${item.url || ''}`;
    case 'customSections': return String(item.title || 'Unnamed');
    default:               return 'Item';
  }
}

interface ChangedField { key: string; original: string; updated: string }

function getChangedFields(
  original: Record<string, unknown>,
  updated: Record<string, unknown>,
): ChangedField[] {
  const changed: ChangedField[] = [];
  for (const key of Object.keys(updated)) {
    if (key === 'id') continue;
    const origVal = String(original[key] ?? '');
    const newVal  = String(updated[key] ?? '');
    if (origVal !== newVal) changed.push({ key, original: origVal, updated: newVal });
  }
  return changed;
}

function FieldDiff({ field }: { field: ChangedField }) {
  if (DESCRIPTION_FIELDS.has(field.key)) return <WordDiff original={field.original} updated={field.updated} />;
  if (DATE_FIELDS.has(field.key))        return <PlainDiff original={formatDate(field.original)} updated={formatDate(field.updated)} />;
  return <PlainDiff original={field.original} updated={field.updated} />;
}

// ── Operation blocks ──────────────────────────────────────────────────────────

function UpdateItemBlock({ op }: { op: UpdateItemOp }) {
  const { changedFields, summary } = useMemo(() => {
    try {
      const original = JSON.parse(op.originalValue) as Record<string, unknown>;
      const updated  = JSON.parse(op.newValue) as Record<string, unknown>;
      return {
        changedFields: getChangedFields(original, updated),
        summary:       getItemSummary(op.sectionType, original),
      };
    } catch {
      return { changedFields: [], summary: 'Item' };
    }
  }, [op]);

  if (changedFields.length === 0) return null;

  return (
    <div className="border border-[#e5e5ea] bg-white rounded-xl p-3 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="shrink-0 text-[10px] bg-[#e5e5ea] text-[#3c3c43] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide">
          edit
        </span>
        <span className="text-[13px] font-medium text-[#1d1d1f] truncate">{summary}</span>
      </div>
      <div className="flex flex-col gap-3">
        {changedFields.map((f) => (
          <div key={f.key}>
            <span className="block text-[10px] font-semibold text-[#6e6e73] tracking-widest uppercase mb-1">
              {FIELD_LABELS[f.key] ?? f.key}
            </span>
            <FieldDiff field={f} />
          </div>
        ))}
      </div>
    </div>
  );
}

function AddItemBlock({ op }: { op: AddItemOp }) {
  const { fields, summary } = useMemo(() => {
    try {
      const item   = JSON.parse(op.newValue) as Record<string, unknown>;
      const fields = Object.entries(item)
        .filter(([k, v]) => k !== 'id' && v !== '' && v != null)
        .map(([k, v]) => ({ key: k, value: String(v) }));
      return { fields, summary: getItemSummary(op.sectionType, item) };
    } catch {
      return { fields: [], summary: 'New item' };
    }
  }, [op]);

  return (
    <div className="border border-[#bbf7d0] bg-[#f0fdf4] rounded-xl p-3 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="shrink-0 text-[10px] bg-[#bbf7d0] text-[#15803d] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide">
          + add
        </span>
        <span className="text-[13px] font-medium text-[#1d1d1f] truncate">{summary}</span>
      </div>
      {fields.length > 0 && (
        <div className="flex flex-col gap-1 mt-0.5">
          {fields.map(({ key, value }) => (
            <div key={key} className="flex gap-2 text-[12px]">
              <span className="text-[#6e6e73] font-medium shrink-0 min-w-[72px]">{FIELD_LABELS[key] ?? key}</span>
              <span className="text-[#1d1d1f]">
                {DESCRIPTION_FIELDS.has(key)
                  ? value.replace(/<[^>]*>/g, '').trim()
                  : DATE_FIELDS.has(key) ? formatDate(value) : value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RemoveItemBlock({ op, sectionItems }: { op: RemoveItemOp; sectionItems?: Array<Record<string, unknown>> }) {
  const summary = useMemo(() => {
    const found = sectionItems?.find((i) => i.id === op.itemId);
    return found ? getItemSummary(op.sectionType, found) : `Item (${op.itemId.slice(0, 8)}…)`;
  }, [op, sectionItems]);

  return (
    <div className="border border-[#fee2e2] bg-[#fff5f5] rounded-xl p-3 flex items-center gap-2">
      <span className="shrink-0 text-[10px] bg-[#fee2e2] text-[#dc2626] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide">
        – remove
      </span>
      <span className="text-[13px] font-medium text-[#1d1d1f] truncate">{summary}</span>
    </div>
  );
}

function SetFieldBlock({ op }: { op: SetFieldOp }) {
  const field: ChangedField = { key: op.field, original: op.originalValue, updated: op.newValue };
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold text-[#6e6e73] tracking-widest uppercase">
        {FIELD_LABELS[op.field] ?? op.field}
      </span>
      <FieldDiff field={field} />
    </div>
  );
}

function SetCustomSectionTitleBlock({ op }: { op: SetTitleOp }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold text-[#6e6e73] tracking-widest uppercase">
        Section Title
      </span>
      <span className="text-[13px] text-[#15803d] bg-[#bbf7d0] rounded px-1.5 py-0.5 inline-block w-fit font-medium">
        {op.value}
      </span>
    </div>
  );
}

function SetAboutMeBlock({ op }: { op: SetAboutMeOp }) {
  const field: ChangedField = { key: 'aboutMe', original: op.originalValue, updated: op.newValue };
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold text-[#6e6e73] tracking-widest uppercase">
        About Me
      </span>
      <FieldDiff field={field} />
    </div>
  );
}

// ── Group builder ─────────────────────────────────────────────────────────────

interface SectionGroup {
  key:         string;
  label:       string;
  sectionType: string | null;
  ops:         CVEditOperation[];
}

function buildGroups(operations: CVEditOperation[]): SectionGroup[] {
  const map = new Map<string, SectionGroup>();

  for (const op of operations) {
    if (op.operationType === 'set_field' || op.operationType === 'set_about_me') {
      if (!map.has('__personal__')) {
        map.set('__personal__', { key: '__personal__', label: 'Personal Info', sectionType: null, ops: [] });
      }
      map.get('__personal__')!.ops.push(op);
    } else if (op.operationType === 'set_custom_section_title') {
      const k = 'customSections';
      if (!map.has(k)) map.set(k, { key: k, label: 'Custom Sections', sectionType: k, ops: [] });
      map.get(k)!.ops.push(op);
    } else {
      const k = op.sectionType;
      if (!map.has(k)) map.set(k, { key: k, label: SECTION_LABELS[k] ?? k, sectionType: k, ops: [] });
      map.get(k)!.ops.push(op);
    }
  }

  return Array.from(map.values());
}

// ── Main component ────────────────────────────────────────────────────────────

export interface AICVDiffViewerProps {
  operations:   CVEditOperation[];
  /** Current store items keyed by sectionType — used to resolve remove_item labels. */
  currentItems?: Partial<Record<string, Array<Record<string, unknown>>>>;
  onAcceptAll:  () => void;
  onReject:     () => void;
  className?:   string;
  size?: 'small' | 'medium' | 'large';
}

export default function AICVDiffViewer({
  operations,
  currentItems = {},
  onAcceptAll,
  onReject,
  className = '',
  size = 'medium',
}: AICVDiffViewerProps) {
  const groups = useMemo(() => buildGroups(operations), [operations]);
  const count  = operations.length;

  return (
    <div className={`border border-[#e5e5ea] rounded-2xl bg-[#f7f7fa] overflow-hidden ${className}`}>

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#e5e5ea]">
        <span className="text-[11px] font-semibold text-[#1d1d1f] tracking-wide flex-1">
          Proposed changes{' '}
          <span className="font-normal text-[#6e6e73]">
            · {count === 1 ? '1 change' : `${count} changes`}
          </span>
        </span>
        <button
          type="button"
          onClick={onReject}
          className="cursor-pointer px-3 py-1 rounded-full text-[11px] font-medium text-red-500 hover:bg-[#ffe5e5] transition-colors duration-200 focus:outline-none"
        >
          Reject
        </button>
        <button
          type="button"
          onClick={onAcceptAll}
          className="cursor-pointer px-3 py-1 rounded-full text-[11px] font-semibold bg-[#0071e3] text-white hover:bg-[#0060c7] transition-colors duration-200 focus:outline-none"
        >
          Accept all
        </button>
      </div>

      {/* Scrollable section groups */}
      <div className={`flex flex-col overflow-y-auto ${size === 'small' ? 'max-h-[200px]' : size === 'large' ? 'max-h-[600px]' : 'max-h-[420px]'}`}>
        {groups.map((group, gi) => (
          <div key={group.key} className={gi > 0 ? 'border-t border-[#e5e5ea]' : ''}>

            {/* Section label */}
            <div className="px-4 pt-3 pb-2 flex items-center gap-2">
              <span className="text-[10px] font-semibold text-[#6e6e73] tracking-widest uppercase whitespace-nowrap">
                {group.label}
              </span>
              <div className="flex-1 h-px bg-[#e5e5ea]" />
            </div>

            {/* Operations */}
            <div className="px-4 pb-3 flex flex-col gap-2">
              {group.ops.map((op, oi) => {
                const key = `${gi}-${oi}`;
                if (op.operationType === 'update_item')
                  return <UpdateItemBlock key={key} op={op} />;
                if (op.operationType === 'add_item')
                  return <AddItemBlock key={key} op={op} />;
                if (op.operationType === 'remove_item')
                  return <RemoveItemBlock key={key} op={op} sectionItems={currentItems[op.sectionType]} />;
                if (op.operationType === 'set_field')
                  return <SetFieldBlock key={key} op={op as SetFieldOp} />;
                if (op.operationType === 'set_custom_section_title')
                  return <SetCustomSectionTitleBlock key={key} op={op as SetTitleOp} />;
                if (op.operationType === 'set_about_me')
                  return <SetAboutMeBlock key={key} op={op as SetAboutMeOp} />;
                return null;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
