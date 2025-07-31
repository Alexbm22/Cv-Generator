import { forwardRef, useEffect, useLayoutEffect, useRef, RefObject } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import "./custom_quill.css";

interface QuillEditorProps {
  onHtmlChange?: (html: string) => void;
  htmlContent?: string;
  placeholder?: string;
}

export interface QuillInstance extends Quill {}

const QuillEditor = forwardRef<QuillInstance, QuillEditorProps>(
  ({ onHtmlChange, htmlContent, placeholder }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<Quill | null>(null);
    const onHtmlChangeRef = useRef(onHtmlChange);

    useLayoutEffect(() => {
      onHtmlChangeRef.current = onHtmlChange;
    });

    useEffect(() => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const editorContainer = container.appendChild(
        container.ownerDocument.createElement("article")
      );
      
      const quill = new Quill(editorContainer, {
        theme: "snow",
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link'],
          ],
        },
        placeholder: placeholder || "Write something...",
      });

      // Custom styling
      const editor = editorContainer.querySelector('.ql-container') as HTMLElement;
      if (editor) editor.classList.add('bg-white', 'rounded-lg');

      const toolbar = editorContainer.querySelector('.ql-toolbar') as HTMLElement;
      if (toolbar) toolbar.classList.add('p-4', 'rounded-lg');

      const editorContent = editorContainer.querySelector('.ql-editor') as HTMLElement;
      if (editorContent) editorContent.classList.add('not-italic', 'text-gray-700', 'text-base');

      // Set refs
      if (ref && typeof ref === 'object') {
        (ref as RefObject<QuillInstance>).current = quill;
      }

      quillRef.current = quill;

      // Set initial content if provided
      if (htmlContent) {
        quill.clipboard.dangerouslyPasteHTML(htmlContent);
      }

      quill.on(Quill.events.TEXT_CHANGE, () => {
        const html = editorContainer.querySelector('.ql-editor')?.innerHTML || '';
        if (onHtmlChangeRef.current) {
          onHtmlChangeRef.current(html);
        }
      });

      return () => {
        if (ref && typeof ref === 'object') {
          (ref as RefObject<QuillInstance | null>).current = null;
        }
        quillRef.current = null;
        container.innerHTML = "";
      };
    }, [ref]);

    return <div ref={containerRef} className="border border-gray-300 rounded-lg overflow-hidden shadow-sm focus:outline-none"></div>;
  }
);

QuillEditor.displayName = "Editor";

export default QuillEditor;