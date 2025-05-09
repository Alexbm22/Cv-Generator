import { useRef } from "react";
import QuillEditor, { QuillInstance } from "./QuillEditor";

interface MainComponentProps {
  htmlContent: string;
  onHtmlChange: (html: string) => void;
  placeholder?: string;
}

export default function MainComponent({htmlContent, onHtmlChange, placeholder}: MainComponentProps) {
  const quillRef = useRef<QuillInstance>(null);

  return (
    <section className="editor-container">
      <QuillEditor
        ref={quillRef}
        htmlContent={htmlContent}
        onHtmlChange={onHtmlChange}
        placeholder={placeholder}
      />
    </section>
  );
}