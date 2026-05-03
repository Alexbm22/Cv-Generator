import { useRef, useEffect, KeyboardEvent } from "react";
import { SendIcon } from "./icons";

interface AiInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isDisabled?: boolean;
}

export default function AiInput({ value, onChange, onSend, isDisabled = false }: AiInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isEmpty = !value.trim() || isDisabled;

  // Auto-resize textarea as content grows
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [value]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isEmpty) onSend();
    }
  };

  return (
    <div className="px-4 pb-4 pt-1">
      <div
        className={[
          "flex items-end gap-2 rounded-xl",
          "bg-[#f2f2f7] border border-transparent",
          "transition-colors duration-150",
          "focus-within:bg-white focus-within:border-[#0071e3]/30 focus-within:shadow-sm",
        ].join(" ")}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          placeholder={isDisabled ? 'AI is thinking…' : 'Ask AI to help improve this section…'}
          rows={1}
          className={[
            "flex-1 resize-none bg-transparent outline-none",
            "text-[13px] text-[#1d1d1f] placeholder:text-[#aeaeb2]",
            "py-2.5 pl-3 pr-1 leading-relaxed",
            "min-h-[40px] max-h-[120px]",
            isDisabled ? "opacity-50 cursor-not-allowed" : "",
          ].join(" ")}
        />
        <button
          type="button"
          disabled={isEmpty}
          onClick={() => {
            if (!isEmpty) onSend();
          }}
          aria-label="Send"
          className={[
            "mb-[7px] mr-[7px] flex-shrink-0",
            "flex items-center justify-center w-7 h-7 rounded-lg",
            "transition-all duration-150 ease-out",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]",
            isEmpty
              ? "bg-[#e5e5ea] text-[#aeaeb2] cursor-default"
              : "bg-[#0071e3] text-white cursor-pointer hover:bg-[#0077ed] active:scale-95",
          ].join(" ")}
        >
          <SendIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
