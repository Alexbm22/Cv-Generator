import { useEffect, useRef } from 'react';
import { ConversationMessage } from '../../../../interfaces/ai';

interface AIConversationProps {
  messages: ConversationMessage[];
  isLoading?: boolean;
}

/**
 * Renders the full AI conversation thread.
 * User messages appear right-aligned; assistant messages appear left-aligned.
 * Never truncates — always shows the complete thread.
 */
export default function AIConversation({ messages, isLoading }: AIConversationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) return null;

  return (
    <div ref={containerRef} className="flex flex-col gap-3 px-4 pb-3 max-h-[300px] overflow-y-auto text-[13px]">
      {messages.map((msg) =>
        msg.role === 'user' ? (
          <UserBubble key={msg.id} content={msg.content} />
        ) : (
          <AssistantBubble key={msg.id} content={msg.content} />
        ),
      )}
      {isLoading && <ThinkingBubble />}
    </div>
  );
}

function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div
        className={[
          'max-w-[80%] px-3 py-2 rounded-2xl rounded-tr-md',
          'bg-[#0071e3] text-white',
          ' leading-relaxed',
          'shadow-sm',
        ].join(' ')}
      >
        {content}
      </div>
    </div>
  );
}

function AssistantBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-start">
      <div
        className={[
          'max-w-[85%] px-3 py-2 rounded-2xl rounded-tl-md',
          'bg-[#f2f2f7] text-[#1d1d1f]',
          'leading-relaxed',
        ].join(' ')}
      >
        {content}
      </div>
    </div>
  );
}

function ThinkingBubble() {
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
          className={[
            'px-3 py-2 rounded-2xl rounded-tl-md',
            'bg-[#f2f2f7] text-[#1d1d1f]',
            'text-[12px] leading-relaxed',
            'flex items-center gap-[3px]',
          ].join(' ')}
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
