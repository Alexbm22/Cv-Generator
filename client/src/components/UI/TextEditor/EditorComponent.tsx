import { useRef } from "react";
import QuillEditor, { QuillInstance } from "./QuillEditor";

interface MainComponentProps {
  htmlContent: string;
  onHtmlChange: (html: string) => void;
  placeholder?: string;
  sectionType?: string;
}

export default function MainComponent({ htmlContent, onHtmlChange, placeholder}: MainComponentProps) {
  const quillRef = useRef<QuillInstance>(null);

  return (
    <section className="editor-container" dir="ltr">
      <div className="relative">
        <QuillEditor
          ref={quillRef}
          htmlContent={htmlContent}
          onHtmlChange={onHtmlChange}
          placeholder={placeholder}
          containerClassName={[
            "border border-[#d2d2d7] overflow-hidden hover:cursor-text",
            "transition-[border-radius] duration-300",
            "rounded-2xl",
          ].join(" ")}
        />
      </div>
    </section>
  );
}