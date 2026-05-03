import { useRef, useState, useCallback } from "react";
import QuillEditor, { QuillInstance } from "./QuillEditor";
import { AiToggleButton, AiPanel } from "./AiAssistant";
import { PendingChange } from "../../../interfaces/ai";

interface MainComponentProps {
  htmlContent: string;
  onHtmlChange: (html: string) => void;
  placeholder?: string;
  sectionType?: string;
}

export default function MainComponent({ htmlContent, onHtmlChange, placeholder, sectionType = "general" }: MainComponentProps) {
  const quillRef = useRef<QuillInstance>(null);
  const [aiOpen, setAiOpen] = useState(false);

  const handleApplyChange = useCallback(
    (proposed: string, changeType: PendingChange["changeType"]) => {
      if (changeType === "append") {
        onHtmlChange(htmlContent + proposed);
      } else {
        // "replace" and "rewrite" both replace the entire content
        onHtmlChange(proposed);
      }
    },
    [htmlContent, onHtmlChange],
  );

  return (
    <section className="editor-container" dir="ltr">
      <div className="relative">
        <div className="absolute top-0 right-2.5 h-11 z-10 flex items-center">
          <AiToggleButton
            isOpen={aiOpen}
            onToggle={() => setAiOpen((prev) => !prev)}
          />
        </div>

        {/* Quill editor – bottom corners squared off when panel is open */}
        <QuillEditor
          ref={quillRef}
          htmlContent={htmlContent}
          onHtmlChange={onHtmlChange}
          placeholder={placeholder}
          containerClassName={[
            "border border-[#d2d2d7] overflow-hidden hover:cursor-text",
            "transition-[border-radius] duration-300",
            aiOpen ? "rounded-t-2xl" : "rounded-2xl",
          ].join(" ")}
        />

        {/* AI panel – slides out from under the editor */}
        <AiPanel
          isOpen={aiOpen}
          sectionType={sectionType}
          currentContent={htmlContent}
          onApplyChange={handleApplyChange}
        />
      </div>
    </section>
  );
}