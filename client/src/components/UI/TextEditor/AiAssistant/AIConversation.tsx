import { useEffect, useRef } from 'react';
import { ConversationMessage } from '../../../../interfaces/ai';

export type AIConversationVariant = 'editor' | 'panel';

interface BubbleColors {
  userBg: string;
  userText: string;
  assistantBg: string;
  assistantText: string;
}

const VARIANT_COLORS: Record<AIConversationVariant, BubbleColors> = {
  editor: {
    userBg: '#0071e3',
    userText: '#ffffff',
    assistantBg: 'transparent',
    assistantText:'#1d1d1f',
  },
  panel: {
    userBg: '#0071e3',
    userText: '#ffffff',
    assistantBg: '#f2f2f7',
    assistantText:'#1d1d1f',
  },
};

interface AIConversationProps {
  messages: ConversationMessage[];
  isLoading?: boolean;
  variant?: AIConversationVariant;
  className?: string;
}

/**
 * Renders the full AI conversation thread.
 * User messages appear right-aligned; assistant messages appear left-aligned.
 * Never truncates — always shows the complete thread.
 */
export default function AIConversation({ messages, isLoading, variant = 'editor', className = '' }: AIConversationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const colors = VARIANT_COLORS[variant];

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) return null;

  return (
    <div ref={containerRef} className={`flex flex-col gap-3 px-4 pb-3 overflow-y-auto text-[14px] ${className}`}>
      {messages.map((msg) =>
        msg.role === 'user' ? (
          <UserBubble key={msg.id} content={msg.content} colors={colors} />
        ) : (
          <AssistantBubble key={msg.id} content={msg.content} colors={colors} />
        ),
      )}
      {isLoading && <ThinkingBubble colors={colors} />}
    </div>
  );
}

function UserBubble({ content, colors }: { content: string; colors: BubbleColors }) {
  return (
    <div className="flex justify-end">
      <div
        className="max-w-[80%] px-3 py-2 rounded-2xl rounded-tr-md leading-relaxed shadow-sm"
        style={{ backgroundColor: colors.userBg, color: colors.userText }}
      >
        {content}
      </div>
    </div>
  );
}

function AssistantBubble({ content, colors }: { content: string; colors: BubbleColors }) {
  return (
    <div className="flex justify-start">
      <div
        className="max-w-[85%] px-3 py-2 rounded-2xl rounded-tl-md leading-relaxed"
        style={{ backgroundColor: colors.assistantBg, color: colors.assistantText }}
      >
        {content}
      </div>
    </div>
  );
}

function ThinkingBubble({ colors }: { colors: BubbleColors }) {
  return (
    <>
      <style>{`
        @keyframes thinking-dot {
          0%, 60%, 100% { opacity: 0.2; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-3px); }
        }
        .thinking-dot:nth-child(1) { animation: thinking-dot 1.2s infinite 0s; }
        .thinking-dot:nth-child(2) { animation: thinking-dot 1.2s infinite 0.2s; }
        .thinking-dot:nth-child(3) { animation: thinking-dot 1.2s infinite 0.4s; }
      `}</style>
      <div className="flex justify-start">
        <div
          className="px-3 py-2 rounded-2xl rounded-tl-md text-[14px] leading-relaxed flex items-center gap-[3px]"
          style={{ backgroundColor: colors.assistantBg, color: colors.assistantText }}
        >
          <span className="text-[11px] text-[#6e6e73] mr-1">Thinking</span>
          <span className="thinking-dot inline-block w-[4px] h-[4px] rounded-full bg-[#6e6e73]" />
          <span className="thinking-dot inline-block w-[4px] h-[4px] rounded-full bg-[#6e6e73]" />
          <span className="thinking-dot inline-block w-[4px] h-[4px] rounded-full bg-[#6e6e73]" />
        </div>
      </div>
    </>
  );
}
