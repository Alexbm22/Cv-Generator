import { useState } from "react";
import { SparklesIcon } from "./icons";
import AiOptions from "./AiOptions";
import AiInput from "./AiInput";

interface AiPanelProps {
  isOpen: boolean;
}

export default function AiPanel({ isOpen }: AiPanelProps) {
  const [prompt, setPrompt] = useState("");

  const handleAppendToInput = (text: string) => {
    setPrompt((prev) => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed} ${text}` : text;
    });
  };

  const handleRemoveFromInput = (text: string) => {
    setPrompt((prev) => prev.replace(text, "").replace(/\s+/g, " ").trim());
  };

  // No-op: API integration handled in future
  const handleSend = () => {
    setPrompt("");
  };

  return (
    <div
      aria-hidden={!isOpen}
      style={{
        maxHeight: isOpen ? "800px" : "0px",
        opacity: isOpen ? 1 : 0,
        transition:
          "max-height 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease-out",
      }}
      className="overflow-hidden border-x border-b border-[#d2d2d7] rounded-b-2xl bg-white"
    >
      {/* Panel header */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-[#f2f2f7]">
        <SparklesIcon className="w-3.5 h-3.5 text-[#0071e3] flex-shrink-0" />
        <span className="text-[11px] font-semibold text-[#1d1d1f] tracking-wide">
          AI Writing Assistant
        </span>
        <span className="ml-auto text-[10px] text-[#aeaeb2] font-medium hidden sm:block">
          Type or select an option below
        </span>
      </div>

      {/* Body — no fixed height so the panel grows with the Advanced section */}
      <div className="pt-3.5">
        <AiInput value={prompt} onChange={setPrompt} onSend={handleSend} />
        <div className="mx-4 mb-3 border-t border-[#f2f2f7]" />
        <AiOptions value={prompt} onAppendToInput={handleAppendToInput} onRemoveFromInput={handleRemoveFromInput} />
      </div>
    </div>
  );
}
