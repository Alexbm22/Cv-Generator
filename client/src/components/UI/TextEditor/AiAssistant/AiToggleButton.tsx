import { SparklesIcon } from "./icons";

interface AiToggleButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function AiToggleButton({ isOpen, onToggle }: AiToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      aria-label={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
      aria-pressed={isOpen}
      className={[
        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full",
        "text-[11px] font-semibold tracking-wide",
        "select-none cursor-pointer",
        "transition-all duration-200 ease-out",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-1",
        "border",
        isOpen
          ? "bg-[#0071e3] text-white shadow-sm border-[#0071e3]/60"
          : "bg-white text-[#6e6e73] border-[#d2d2d7] shadow-sm hover:text-[#0071e3] hover:border-[#0071e3]/60 hover:shadow",
      ].join(" ")}
    >
      <SparklesIcon className="w-3.5 h-3.5 flex-shrink-0" />
      <span>AI</span>
    </button>
  );
}
