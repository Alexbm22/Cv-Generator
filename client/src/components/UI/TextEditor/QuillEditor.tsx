import { forwardRef, useEffect, useLayoutEffect, useRef, RefObject } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import "./custom_quill.css";

interface QuillEditorProps {
  onHtmlChange?: (html: string) => void;
  htmlContent?: string;
  placeholder?: string;
  containerClassName?: string;
}

export interface QuillInstance extends Quill {}

const QuillEditor = forwardRef<QuillInstance, QuillEditorProps>(
  ({ onHtmlChange, htmlContent, placeholder, containerClassName }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<Quill | null>(null);
    const onHtmlChangeRef = useRef(onHtmlChange);
    const isExternalUpdateRef = useRef(false);

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
      if (editorContent) editorContent.classList.add('not-italic', 'text-[#1d1d1f]', 'text-[15px]');

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
        if (isExternalUpdateRef.current) return;
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

    // Sync htmlContent prop into the Quill DOM whenever it changes externally
    // (e.g. initial async load or AI apply). Guard with isExternalUpdateRef to
    // suppress the TEXT_CHANGE event that dangerouslyPasteHTML fires, preventing
    // an infinite update loop.
    useEffect(() => {
      if (!quillRef.current || htmlContent === undefined) return;
      const currentHtml = quillRef.current.root.innerHTML;
      if (currentHtml === htmlContent) return;
      isExternalUpdateRef.current = true;
      quillRef.current.clipboard.dangerouslyPasteHTML(htmlContent);
      isExternalUpdateRef.current = false;
    }, [htmlContent]);

    return (
      <div
        ref={containerRef}
        className={
          containerClassName ??
          "border border-[#d2d2d7] rounded-2xl overflow-hidden hover:cursor-text"
        }
        onClick={() => quillRef.current?.focus()}
      />
    );
  }
);

QuillEditor.displayName = "Editor";

export default QuillEditor;