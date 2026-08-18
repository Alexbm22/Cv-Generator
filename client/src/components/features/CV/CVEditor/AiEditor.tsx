import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Sparkles, Settings, Briefcase } from 'lucide-react';
import { useCvEditStore, useAiStore } from '../../../../Store';
import AIConversation from '../../../UI/TextEditor/AiAssistant/AIConversation';
import AiInput from '../../../UI/TextEditor/AiAssistant/AiInput';
import AiOptions from '../../../UI/TextEditor/AiAssistant/AiOptions';
import AICVDiffViewer from '../../../UI/TextEditor/AiAssistant/AICVDiffViewer';
import AISettingsDialog from '../../../UI/AISettingsDialog';

const AiEditor: React.FC<{ isShowingPreview: boolean }> = ({ isShowingPreview }) => {
  const [prompt, setPrompt] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [focusJobDescription, setFocusJobDescription] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const conversation = useAiStore((s) => s.conversation);
  const pendingOperations = useAiStore((s) => s.pendingOperations);
  const isLoading = useAiStore((s) => s.isLoading);
  const sendMessage = useAiStore((s) => s.sendMessage);
  const acceptAll = useAiStore((s) => s.acceptAll);
  const reject = useAiStore((s) => s.reject);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [conversation, isLoading]);

  const workExperience = useCvEditStore((s) => s.workExperience);
  const education = useCvEditStore((s) => s.education);
  const projects = useCvEditStore((s) => s.projects);
  const skills = useCvEditStore((s) => s.skills);
  const languages = useCvEditStore((s) => s.languages);
  const socialLinks = useCvEditStore((s) => s.socialLinks);
  const customSections = useCvEditStore((s) => s.customSections);

  const currentItems = useMemo<Partial<Record<string, Array<Record<string, unknown>>>>>(() => ({
    workExperience: workExperience as unknown as Array<Record<string, unknown>>,
    education: education as unknown as Array<Record<string, unknown>>,
    projects: projects as unknown as Array<Record<string, unknown>>,
    skills: skills as unknown as Array<Record<string, unknown>>,
    languages: languages as unknown as Array<Record<string, unknown>>,
    socialLinks: socialLinks as unknown as Array<Record<string, unknown>>,
    customSections: customSections.content as unknown as Array<Record<string, unknown>>,
  }), [workExperience, education, projects, skills, languages, socialLinks, customSections]);

  const handleSend = useCallback(async () => {
    await sendMessage(prompt);
    setPrompt('');
  }, [prompt, sendMessage]);

  const handleAcceptAll = useCallback(() => {
    acceptAll();
  }, [acceptAll]);

  const handleReject = useCallback(() => {
    reject();
  }, [reject]);

  // TODO: implement this when ready
  const handleAddJobDetails = () => {
    setFocusJobDescription(true);
    setIsSettingsOpen(true);
  };

  const handleAppendToInput = (text: string) =>
    setPrompt((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text));

  const handleRemoveFromInput = (text: string) =>
    setPrompt((prev) => prev.replace(text, '').replace(/\s+/g, ' ').trim());

  const hasPendingOps = pendingOperations.length > 0;

  return (
    <div
      className="transition-all duration-1000 bg-[#f5f5f7] w-full shadow-lg z-0.5 flex flex-col max-h-[calc(100vh-60px)] overflow-hidden"
      style={isShowingPreview ? { flexBasis: '56.25%' } : { flexBasis: '100%' }}
    >
      <div className="flex items-center gap-3 px-6 py-3 border-b border-[#daeaf9] bg-white shrink-0 min-h-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#ebf4ff] text-[#007dff]">
          <Sparkles size={16} strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-[14px] font-semibold text-[#1d1d1f] leading-tight">AI Editor</h2>
          <p className="text-[11px] text-[#6e6e73]">Edit your entire CV with AI</p>
        </div>
        <div className="ml-auto flex items-center gap-0.5">
          {isLoading && (
            <div className="flex items-center gap-1.5 mr-2 text-[11px] text-[#0071e3] font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#0071e3] animate-pulse" />
              Thinking…
            </div>
          )}

          <button
            onClick={handleAddJobDetails}
            className="group flex items-center h-9 hover:px-[9px] rounded-xl text-[12px] font-medium gap-2 text-[#404245] hover:bg-[#f2f2f7] active:bg-[#cfe3f7] transition-all duration-600 shrink-0 cursor-pointer select-none"
            aria-label="Add job details"
          >
            <Briefcase size={20} strokeWidth={1.75} className="shrink-0" />
            <span className="max-w-0 group-hover:max-w-[110px] opacity-0 group-hover:opacity-100  overflow-hidden whitespace-nowrap transition-all duration-600 ease-in-out">
              Add job details
            </span>
          </button>

          <button
            className="flex items-center justify-center w-9 h-9 rounded-xl text-[#404245] hover:bg-[#f2f2f7] active:bg-[#e5e5ea] transition-colors duration-150 cursor-pointer"
            aria-label="AI Editor settings"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings size={20} strokeWidth={1.5} />
          </button>

          <AISettingsDialog
            isOpen={isSettingsOpen}
            onClose={() => { setIsSettingsOpen(false); setFocusJobDescription(false); }}
            focusJobDescription={focusJobDescription}
          />
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto flex flex-col min-h-0">
        {conversation.length === 0 && !hasPendingOps && !isLoading && (
          <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center px-8 py-12">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#ddeaf9] text-[#007dff]">
              <Sparkles size={22} strokeWidth={1.5} />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[13px] font-medium text-[#1d1d1f]">Start editing your CV</p>
              <p className="text-[12px] text-[#6e6e73] max-w-xs leading-relaxed">
                Describe what you'd like to improve — strengthen language, fix dates, add bullet points, and more.
              </p>
            </div>
          </div>
        )}

        {hasPendingOps && (
          <div className="sticky top-0 z-10 px-6 pt-1 bg-[#f5f5f7] pb-3 border-b border-[#daeaf9]">
            <AICVDiffViewer
              operations={pendingOperations}
              currentItems={currentItems}
              onAcceptAll={handleAcceptAll}
              onReject={handleReject}
              className="bg-white shadow-md rounded-2xl border border-[#f0f0f0]"
              size="small"
              areActionsDisabled={isLoading}
            />
          </div>
        )}

        {(conversation.length > 0 || isLoading) && (
          <div className="pt-3 px-3">
            <AIConversation messages={conversation} isLoading={isLoading} variant="editor" />
          </div>
        )}
      </div>

      <div className="p-6 pt-0 pb-5">
        <div className="flex flex-col bg-white shrink-0 px-3 py-3 gap-3 rounded-2xl border border-[#f0f0f0]" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.07), 0 1.5px 6px rgba(0,0,0,0.04)' }}>
          <AiInput
            value={prompt}
            onChange={setPrompt}
            onSend={handleSend}
            isDisabled={isLoading}
          />
          <div className="my-0.5 mx-2 border-t border-[#f2f2f7]" />
          <AiOptions
            value={prompt}
            onAppendToInput={handleAppendToInput}
            onRemoveFromInput={handleRemoveFromInput}
          />
        </div>
      </div>
    </div>
  );
};

export default AiEditor;

