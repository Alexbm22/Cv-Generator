import { useState, useEffect } from "react";
import { ADVANCED_OPTIONS, STANDARD_OPTIONS } from "../../../../constants/CV/AI/aiOptions";

export interface AiOption {
  id: string;
  label: string;
  insertText: string;
  description: string;
}

interface OptionChipProps {
  option: AiOption;
  isSelected: boolean;
  onToggle: (option: AiOption) => void;
}

function OptionChip({ option, isSelected, onToggle }: OptionChipProps) {
  return (
    <button
      type="button"
      title={option.description}
      onClick={() => onToggle(option)}
      className={[
        "inline-flex items-center px-3 py-1.5 rounded-full",
        "text-[12px] font-medium whitespace-nowrap",
        "transition-all duration-150 ease-out",
        "cursor-pointer select-none",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]",
        isSelected
          ? "bg-[#0071e3] text-white shadow-sm"
          : "bg-[#f2f2f7] text-[#3c3c43] hover:bg-[#e5e5ea] hover:text-[#1d1d1f]",
      ].join(" ")}
    >
      {option.label}
    </button>
  );
}

interface AiOptionsProps {
  value: string;
  onAppendToInput: (text: string) => void;
  onRemoveFromInput: (text: string) => void;
}

export default function AiOptions({ value, onAppendToInput, onRemoveFromInput }: AiOptionsProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // Deselect chips whose insertText was removed from the input
  useEffect(() => {
    const allOptions = [...STANDARD_OPTIONS, ...ADVANCED_OPTIONS];
    setSelectedIds((prev) => {
      const next = new Set(prev);
      let changed = false;
      for (const option of allOptions) {
        if (next.has(option.id) && !value.includes(option.insertText)) {
          next.delete(option.id);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [value]);

  const handleToggle = (option: AiOption) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(option.id)) {
        next.delete(option.id);
        onRemoveFromInput(option.insertText);
      } else {
        next.add(option.id);
        onAppendToInput(option.insertText);
      }
      return next;
    });
  };

  return (
    <div className="px-4 pb-3 space-y-3">
      {/* Standard Options */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#aeaeb2]">
          Quick Actions
        </p>
        <div className="flex flex-wrap gap-1.5">
          {STANDARD_OPTIONS.map((option) => (
            <OptionChip
              key={option.id}
              option={option}
              isSelected={selectedIds.has(option.id)}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </div>

      {/* Advanced Options */}
      <div className="space-y-1.5">
        <button
          type="button"
          onClick={() => setAdvancedOpen((v) => !v)}
          className="flex items-center gap-1 cursor-pointer select-none focus:outline-none group"
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#aeaeb2] group-hover:text-[#6e6e73] transition-colors duration-150">
            Advanced
          </p>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3 h-3 text-[#aeaeb2] group-hover:text-[#6e6e73] transition-all duration-200"
            style={{ transform: advancedOpen ? "rotate(180deg)" : "rotate(0deg)" }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        <div
          style={{
            maxHeight: advancedOpen ? "200px" : "0px",
            opacity: advancedOpen ? 1 : 0,
            transition: "max-height 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease-out",
          }}
          className="overflow-hidden"
        >
          <div className="flex flex-wrap gap-1.5">
            {ADVANCED_OPTIONS.map((option) => (
              <OptionChip
                key={option.id}
                option={option}
                isSelected={selectedIds.has(option.id)}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
