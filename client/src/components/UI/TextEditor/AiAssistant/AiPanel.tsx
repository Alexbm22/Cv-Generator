import { useState, useRef, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { SparklesIcon } from "./icons";
import AiOptions from "./AiOptions";
import AiInput from "./AiInput";
import AIConversation from "./AIConversation";
import AIDiffViewer from "./AIDiffViewer";
import { sendAIMessage } from "../../../../services/ai";
import {
  AIPanelState,
  ConversationMessage,
  PendingChange,
} from "../../../../interfaces/ai";

interface AiPanelProps {
  isOpen: boolean;
  sectionType: string;
  currentContent: string;
  onApplyChange: (proposed: string, changeType: PendingChange["changeType"]) => void;
}

const INITIAL_STATE: AIPanelState = {
  conversation: [],
  history: [],
  pendingChange: null,
  isLoading: false,
};

export default function AiPanel({
  isOpen,
  sectionType,
  currentContent,
  onApplyChange,
}: AiPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [state, setState] = useState<AIPanelState>(INITIAL_STATE);
  const abortControllerRef = useRef<AbortController | null>(null);

  // ── Submit handler ────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || state.isLoading) return;

    // Append user message to conversation immediately (optimistic update)
    const userMessage: ConversationMessage = {
      id: uuidv4(),
      role: "user",
      content: trimmedPrompt,
    };

    setState((prev) => ({
      ...prev,
      isLoading: true,
      pendingChange: null, // Clear any previous pending diff
      conversation: [...prev.conversation, userMessage],
    }));

    setPrompt("");

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const { change, message, history } = await sendAIMessage({
        prompt: trimmedPrompt,
        history: state.history,
        sectionType,
        currentContent,
        signal: controller.signal,
      });

      // Deterministic processing order: change → message → history
      setState((prev) => ({
        ...prev,
        pendingChange: change,
        conversation: [
          ...prev.conversation,
          {
            id: uuidv4(),
            role: "assistant" as const,
            content: message,
          } satisfies ConversationMessage,
        ],
        history,
      }));
    } catch (err: unknown) {
      const isAbort = err instanceof DOMException && err.name === "AbortError";
      if (!isAbort) {
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred.";
        setState((prev) => ({
          ...prev,
          conversation: [
            ...prev.conversation,
            {
              id: uuidv4(),
              role: "assistant" as const,
              content: `Error: ${message}`,
            } satisfies ConversationMessage,
          ],
        }));
      }
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [prompt, state.isLoading, state.history, sectionType, currentContent]);

  // ── Diff actions ──────────────────────────────────────────────────────────
  const handleAccept = useCallback(() => {
    if (!state.pendingChange) return;
    onApplyChange(state.pendingChange.proposed, state.pendingChange.changeType);
    setState((prev) => ({ ...prev, pendingChange: null }));
  }, [state.pendingChange, onApplyChange]);

  const handleReject = useCallback(() => {
    setState((prev) => ({ ...prev, pendingChange: null }));
  }, []);

  // ── Predefined prompt helpers ─────────────────────────────────────────────
  const handleAppendToInput = (text: string) => {
    setPrompt((prev) => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed} ${text}` : text;
    });
  };

  const handleRemoveFromInput = (text: string) => {
    setPrompt((prev) => prev.replace(text, "").replace(/\s+/g, " ").trim());
  };

  return (
    <div
      aria-hidden={!isOpen}
      style={{
        maxHeight: isOpen ? "1400px" : "0px",
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
        {state.isLoading && (
          <span className="ml-2 flex items-center gap-1.5 text-[10px] text-[#0071e3] font-medium">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#0071e3] animate-pulse" />
            Thinking…
          </span>
        )}
        <span className="ml-auto text-[10px] text-[#aeaeb2] font-medium hidden sm:block">
          {state.conversation.length === 0 ? "Type or select an option below" : null}
        </span>
      </div>

      {/* Body */}
      <div className={state.pendingChange ? '' : 'pt-3.5'}>
        {/* Structured diff viewer — sits right below the editor, above the conversation */}
        {state.pendingChange && (
          <AIDiffViewer
            pendingChange={state.pendingChange}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        )}

        {/* Conversation thread */}
        {(state.conversation.length > 0 || state.isLoading) && (
          <AIConversation messages={state.conversation} isLoading={state.isLoading} />
        )}

        {/* Separator before input row */}
        {(state.conversation.length > 0 || state.pendingChange || state.isLoading) && (
          <div className="mx-4 mb-1 border-t border-[#f2f2f7]" />
        )}

        <AiInput
          value={prompt}
          onChange={setPrompt}
          onSend={handleSend}
          isDisabled={state.isLoading}
        />

        <div className="mx-4 mb-3 border-t border-[#f2f2f7]" />

        <AiOptions
          value={prompt}
          onAppendToInput={handleAppendToInput}
          onRemoveFromInput={handleRemoveFromInput}
        />
      </div>
    </div>
  );
}

