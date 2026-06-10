import { useState, useRef, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { SparklesIcon } from "./icons";
import AiOptions from "./AiOptions";
import AiInput from "./AiInput";
import AIConversation from "./AIConversation";
import AISectionDiffViewer from "./AISectionDiffViewer";
import AIDiffViewer from "./AIDiffViewer";
import { sendSectionEditMessage, sendTextFieldEditMessage, sendAboutMeEditMessage } from "../../../../services/ai";
import { useAuthStore, useCvEditStore } from "../../../../Store";
import {
  AIPanelState,
  ConversationMessage,
  CVEditOperation,
} from "../../../../interfaces/ai";

interface AiPanelProps {
  isOpen: boolean;
  sectionType: string;
  // ── Section item mode (when contentId is provided) ────────────────────────
  contentId?: string;
  currentItem?: Record<string, unknown>;
  onApplyChange?: (newItem: Record<string, unknown>) => void;
  // ── Text field mode (when contentId is absent, e.g. aboutMe) ─────────────
  currentText?: string;
  onApplyTextChange?: (newText: string) => void;
}

const INITIAL_STATE: AIPanelState = {
  conversation: [],
  history: [],
  pendingOperation: null,
  pendingTextChange: null,
  isLoading: false,
};

export default function AiPanel({
  isOpen,
  sectionType,
  contentId,
  currentItem,
  onApplyChange,
  currentText,
  onApplyTextChange,
}: AiPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [state, setState] = useState<AIPanelState>(INITIAL_STATE);
  const abortControllerRef = useRef<AbortController | null>(null);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const storedCvId = useCvEditStore((s) => s.id);
  const cvId = isAuthenticated && storedCvId ? storedCvId : undefined;

  const isItemMode = !!contentId;

  // ── Submit handler ────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || state.isLoading) return;

    const userMessage: ConversationMessage = {
      id: uuidv4(),
      role: "user",
      content: trimmedPrompt,
    };

    setState((prev) => ({
      ...prev,
      isLoading: true,
      conversation: [...prev.conversation, userMessage],
    }));

    setPrompt("");

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      if (isItemMode && contentId && currentItem) {
        // ── Section item edit ───────────────────────────────────────────────
        const { operation, message, history } = await sendSectionEditMessage({
          prompt: trimmedPrompt,
          history: state.history,
          sectionType,
          contentId,
          currentItem,
          pendingOperation: state.pendingOperation ?? undefined,
          signal: controller.signal,
          cvId,
        });

        setState((prev) => ({
          ...prev,
          pendingOperation: operation,
          conversation: [
            ...prev.conversation,
            { id: uuidv4(), role: "assistant" as const, content: message } satisfies ConversationMessage,
          ],
          history,
        }));
      } else if (sectionType === 'aboutMe') {
        // ── About Me dedicated route ────────────────────────────────────────
        const { setAboutMe, message, history } = await sendAboutMeEditMessage({
          prompt: trimmedPrompt,
          history: state.history,
          signal: controller.signal,
          pendingTextChange: state.pendingTextChange ?? undefined,
          ...(cvId ? { cvId } : { currentText: currentText ?? '' }),
        });

        setState((prev) => ({
          ...prev,
          pendingTextChange: { original: setAboutMe.originalValue, proposed: setAboutMe.newValue },
          conversation: [
            ...prev.conversation,
            { id: uuidv4(), role: "assistant" as const, content: message } satisfies ConversationMessage,
          ],
          history,
        }));
      } else {
        const pendingOperations: CVEditOperation[] | undefined = state.pendingTextChange
          ? [{ operationType: 'set_field' as const, field: sectionType, newValue: state.pendingTextChange.proposed, originalValue: state.pendingTextChange.original }]
          : undefined;

        const { operations, message, history } = await sendTextFieldEditMessage({
          prompt: trimmedPrompt,
          history: state.history,
          sectionType,
          currentText: currentText ?? "",
          pendingOperations,
          signal: controller.signal,
          ...(cvId ? { cvId } : { cvData: useCvEditStore.getState().getCVObject() }),
        });

        const setFieldOp = operations.find((op) => op.operationType === "set_field");

        setState((prev) => ({
          ...prev,
          pendingTextChange: setFieldOp
            ? { original: setFieldOp.originalValue, proposed: setFieldOp.newValue }
            : null,
          conversation: [
            ...prev.conversation,
            { id: uuidv4(), role: "assistant" as const, content: message } satisfies ConversationMessage,
          ],
          history,
        }));
      }
    } catch (err: unknown) {
      const isAbort = err instanceof DOMException && err.name === "AbortError";
      if (!isAbort) {
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred.";
        setState((prev) => ({
          ...prev,
          conversation: [
            ...prev.conversation,
            { id: uuidv4(), role: "assistant" as const, content: `Error: ${message}` } satisfies ConversationMessage,
          ],
        }));
      }
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [prompt, state.isLoading, state.history, sectionType, contentId, currentItem, currentText, cvId, isItemMode, state.pendingTextChange, state.pendingOperation]);

  // ── Diff actions ──────────────────────────────────────────────────────────
  const handleAccept = useCallback(() => {
    if (state.isLoading) return;
    if (state.pendingOperation) {
      try {
        const newItem = JSON.parse(state.pendingOperation.newValue) as Record<string, unknown>;
        onApplyChange?.(newItem);
      } catch {
        // Malformed JSON from AI — dismiss silently
      }
      setState((prev) => ({ ...prev, pendingOperation: null }));
    } else if (state.pendingTextChange) {
      onApplyTextChange?.(state.pendingTextChange.proposed);
      setState((prev) => ({ ...prev, pendingTextChange: null }));
    }
  }, [state.pendingOperation, state.pendingTextChange, onApplyChange, onApplyTextChange, state.isLoading]);

  const handleReject = useCallback(() => {
    if (state.isLoading) return;
    setState((prev) => ({ ...prev, pendingOperation: null, pendingTextChange: null }));
  }, [state.isLoading]);

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

  const hasPendingDiff = !!(state.pendingOperation || state.pendingTextChange);

  return (
    <div
      aria-hidden={!isOpen}
      style={{
        maxHeight: isOpen ? "1400px" : "0px",
        opacity: isOpen ? 1 : 0,
        marginTop: isOpen ? "12px" : "0px",
        transition:
          "max-height 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease-out, margin-top 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      className="overflow-hidden border border-[#d2d2d7] rounded-2xl bg-white"
    >
      {/* Panel header */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-3">
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

      <div className="mx-4 mb-1 border-t border-[#f2f2f7]" />

      {/* Body */}
      <div className={hasPendingDiff ? '' : 'pt-3.5'}>
        {state.pendingOperation && (
          <AISectionDiffViewer
            operation={state.pendingOperation}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        )}

        {state.pendingTextChange && (
          <AIDiffViewer
            original={state.pendingTextChange.original}
            proposed={state.pendingTextChange.proposed}
            onAccept={handleAccept}
            onReject={handleReject}
            areActionsDisabled={state.isLoading}
          />
        )}

        {/* Conversation thread */}
        {(state.conversation.length > 0 || state.isLoading) && (
          <AIConversation messages={state.conversation} isLoading={state.isLoading} variant="panel" className="max-h-[300px]" />
        )}

        {/* Separator before input row */}
        {(state.conversation.length > 0 || hasPendingDiff || state.isLoading) && (
          <div className="mx-4 mb-1 border-t border-[#f2f2f7]" />
        )}

        <div className="px-4 pb-4 pt-1">
          <AiInput
            value={prompt}
            onChange={setPrompt}
            onSend={handleSend}
            isDisabled={state.isLoading}
          />
        </div>

        <div className="mx-4 mb-3 border-t border-[#f2f2f7]" />

        <div className="px-4 pb-3">
          <AiOptions
            value={prompt}
            onAppendToInput={handleAppendToInput}
            onRemoveFromInput={handleRemoveFromInput}
          />
        </div>
      </div>
    </div>
  );
}

