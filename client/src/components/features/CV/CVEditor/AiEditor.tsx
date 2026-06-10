import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Sparkles } from 'lucide-react';
import { useCvEditStore, useAuthStore } from '../../../../Store';
import AIConversation from '../../../UI/TextEditor/AiAssistant/AIConversation';
import AiInput from '../../../UI/TextEditor/AiAssistant/AiInput';
import AiOptions from '../../../UI/TextEditor/AiAssistant/AiOptions';
import AICVDiffViewer from '../../../UI/TextEditor/AiAssistant/AICVDiffViewer';
import { sendCVEditMessage } from '../../../../services/ai';
import { sanitizeHtml } from '../../../../utils';
import {
  CVEditOperation,
  ConversationMessage,
  HistoryEntry,
} from '../../../../interfaces/ai';
import {
  Language,
  Skill,
  WorkExperience,
  Education,
  Project,
  CustomSectionAttributes,
  SocialLink,
} from '../../../../interfaces/cv';

interface CVEditorAIState {
  conversation: ConversationMessage[];
  history: HistoryEntry[];
  pendingOperations: CVEditOperation[];
  isLoading: boolean;
}

const INITIAL_STATE: CVEditorAIState = {
  conversation: [],
  history: [],
  pendingOperations: [],
  isLoading: false,
};

function parseDate(value: unknown): Date {
  if (!value) return new Date();
  const d = new Date(String(value));
  return isNaN(d.getTime()) ? new Date() : d;
}

function applyAIOperations(operations: CVEditOperation[]) {
  const store = useCvEditStore.getState();

  for (const op of operations) {
    try {
      switch (op.operationType) {

        case 'update_item': {
          const next = JSON.parse(op.newValue) as Record<string, unknown>;

          switch (op.sectionType) {
            case 'workExperience':
              store.updateWorkExperience(op.itemId, {
                ...(next as Partial<WorkExperience>),
                ...(next.startDate !== undefined && { startDate: parseDate(next.startDate) }),
                ...(next.endDate !== undefined && { endDate: parseDate(next.endDate) }),
                ...(next.description !== undefined && { description: sanitizeHtml(String(next.description)) }),
              });
              break;
            case 'education':
              store.updateEducation(op.itemId, {
                ...(next as Partial<Education>),
                ...(next.startDate !== undefined && { startDate: parseDate(next.startDate) }),
                ...(next.endDate !== undefined && { endDate: parseDate(next.endDate) }),
                ...(next.description !== undefined && { description: sanitizeHtml(String(next.description)) }),
              });
              break;
            case 'projects':
              store.updateProject(op.itemId, {
                ...(next as Partial<Project>),
                ...(next.startDate !== undefined && { startDate: parseDate(next.startDate) }),
                ...(next.endDate !== undefined && { endDate: parseDate(next.endDate) }),
                ...(next.description !== undefined && { description: sanitizeHtml(String(next.description)) }),
              });
              break;
            case 'customSections':
              store.updateCustomSectionAttributes(op.itemId, {
                ...(next as Partial<CustomSectionAttributes>),
                ...(next.startDate !== undefined && { startDate: parseDate(next.startDate) }),
                ...(next.endDate !== undefined && { endDate: parseDate(next.endDate) }),
                ...(next.description !== undefined && { description: sanitizeHtml(String(next.description)) }),
              });
              break;
            case 'skills':
              store.updateSkill(op.itemId, next as Partial<Skill>);
              break;
            case 'languages':
              store.updateLanguage(op.itemId, next as Partial<Language>);
              break;
            case 'socialLinks':
              store.updateSocialLink(op.itemId, next as Partial<SocialLink>);
              break;
          }
          break;
        }

        case 'add_item': {
          const item = JSON.parse(op.newValue) as Record<string, unknown>;

          switch (op.sectionType) {
            case 'workExperience':
              store.addWorkExperience({
                jobTitle:    String(item.jobTitle ?? ''),
                company:     String(item.company ?? ''),
                startDate:   parseDate(item.startDate),
                endDate:     parseDate(item.endDate),
                description: sanitizeHtml(String(item.description ?? '')),
              });
              break;
            case 'education':
              store.addEducation({
                degree: String(item.degree ?? ''),
                institution: String(item.institution ?? ''),
                startDate: parseDate(item.startDate),
                endDate: parseDate(item.endDate),
                description: sanitizeHtml(String(item.description ?? '')),
              });
              break;
            case 'projects':
              store.addProject({
                name: String(item.name ?? ''),
                url: String(item.url ?? ''),
                startDate: parseDate(item.startDate),
                endDate: parseDate(item.endDate),
                description: sanitizeHtml(String(item.description ?? '')),
              });
              break;
            case 'customSections':
              store.addCustomSectionAttributes({
                title: String(item.title ?? ''),
                startDate:  parseDate(item.startDate),
                endDate: parseDate(item.endDate),
                description: sanitizeHtml(String(item.description ?? '')),
              });
              break;
            case 'skills':
              store.addSkill({
                name: String(item.name ?? ''),
                level: (item.level as Skill['level']) ?? null,
              });
              break;
            case 'languages':
              store.addLanguage({
                name: String(item.name ?? ''),
                level: (item.level as Language['level']) ?? null,
              });
              break;
            case 'socialLinks':
              store.addSocialLink({
                platform: String(item.platform ?? ''),
                url: String(item.url ?? ''),
              });
              break;
          }
          break;
        }

        case 'remove_item': {
          switch (op.sectionType) {
            case 'workExperience': store.removeWorkExperience(op.itemId); break;
            case 'education': store.removeEducation(op.itemId); break;
            case 'projects': store.removeProject(op.itemId); break;
            case 'customSections': store.removeCustomSectionAttributes(op.itemId); break;
            case 'skills': store.removeSkill(op.itemId); break;
            case 'languages': store.removeLanguage(op.itemId); break;
            case 'socialLinks': store.removeSocialLink(op.itemId); break;
          }
          break;
        }

        case 'set_field': {
          switch (op.field) {
            case 'firstName': store.setFirstName(op.newValue); break;
            case 'lastName': store.setLastName(op.newValue); break;
            case 'email': store.setEmail(op.newValue); break;
            case 'phoneNumber': store.setPhoneNumber(op.newValue); break;
            case 'address': store.setAddress(op.newValue); break;
            case 'jobTitle': store.setJobTitle(op.newValue); break;
            case 'aboutMe': store.setAboutMe(sanitizeHtml(op.newValue)); break;
          }
          break;
        }

        case 'set_custom_section_title': {
          store.setCustomSectionTitle(op.value);
          break;
        }
        case 'set_about_me': {
          store.setAboutMe(sanitizeHtml(op.newValue));
          break;
        }
      }
    } catch (error) {
      console.error('Error processing AI editor operation:', error);
    }
  }
}

const AiEditor: React.FC<{ isShowingPreview: boolean }> = ({ isShowingPreview }) => {
  const [prompt, setPrompt] = useState('');
  const [state, setState] = useState<CVEditorAIState>(INITIAL_STATE);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [state.conversation, state.isLoading]);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const cvId = useCvEditStore((s) => s.id);

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
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || state.isLoading) return;

    const userMsg: ConversationMessage = { id: uuidv4(), role: 'user', content: trimmedPrompt };

    setState((prev) => ({
      ...prev,
      isLoading: true,
      conversation: [...prev.conversation, userMsg],
    }));

    setPrompt('');

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const baseParams = { prompt: trimmedPrompt, history: state.history, pendingOperations: state.pendingOperations, signal: controller.signal };
      const params = isAuthenticated && cvId
        ? { ...baseParams, cvId }
        : { ...baseParams, cvData: useCvEditStore.getState().getGuestCVAIData() };

      const { operations, message, history } = await sendCVEditMessage(params);

      setState((prev) => ({
        ...prev,
        pendingOperations: operations,
        conversation: [
          ...prev.conversation,
          { id: uuidv4(), role: 'assistant' as const, content: message } satisfies ConversationMessage,
        ],
        history,
      }));
    } catch (err: unknown) {
      const isAbort = err instanceof DOMException && err.name === 'AbortError';
      if (!isAbort) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
        setState((prev) => ({
          ...prev,
          conversation: [
            ...prev.conversation,
            { id: uuidv4(), role: 'assistant' as const, content: `Error: ${message}` } satisfies ConversationMessage,
          ],
        }));
      }
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [prompt, state.isLoading, state.history, state.pendingOperations, isAuthenticated, cvId]);

  const handleAcceptAll = useCallback(() => {
    if (state.pendingOperations.length === 0 || state.isLoading) return;
    applyAIOperations(state.pendingOperations);
    setState((prev) => ({ ...prev, pendingOperations: [] }));
  }, [state.pendingOperations, state.isLoading]);

  const handleReject = useCallback(() => {
    if (state.pendingOperations.length === 0 || state.isLoading) return;
    setState((prev) => ({ ...prev, pendingOperations: [] }));
  }, [state.pendingOperations, state.isLoading]);

  const handleAppendToInput = (text: string) =>
    setPrompt((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text));

  const handleRemoveFromInput = (text: string) =>
    setPrompt((prev) => prev.replace(text, '').replace(/\s+/g, ' ').trim());

  const hasPendingOps = state.pendingOperations.length > 0;

  return (
    <div
      className="transition-all duration-1000 bg-[#f5f5f7] w-full shadow-lg z-0.5 flex flex-col max-h-[calc(100vh-60px)] overflow-hidden"
      style={isShowingPreview ? { flexBasis: '56.25%' } : { flexBasis: '100%' }}
    >
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#daeaf9] bg-white shrink-0 min-h-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#ebf4ff] text-[#007dff]">
          <Sparkles size={16} strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-[14px] font-semibold text-[#1d1d1f] leading-tight">AI Editor</h2>
          <p className="text-[11px] text-[#6e6e73]">Edit your entire CV with AI</p>
        </div>
        {state.isLoading && (
          <div className="ml-auto flex items-center gap-1.5 text-[11px] text-[#0071e3] font-medium">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#0071e3] animate-pulse" />
            Thinking…
          </div>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto flex flex-col min-h-0">
        {state.conversation.length === 0 && !hasPendingOps && !state.isLoading && (
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
              operations={state.pendingOperations}
              currentItems={currentItems}
              onAcceptAll={handleAcceptAll}
              onReject={handleReject}
              className="bg-white shadow-md rounded-2xl border border-[#f0f0f0]"
              size="small"
              areActionsDisabled={state.isLoading}
            />
          </div>
        )}

        {(state.conversation.length > 0 || state.isLoading) && (
          <div className="pt-3 px-3">
            <AIConversation messages={state.conversation} isLoading={state.isLoading} variant="editor" />
          </div>
        )}
      </div>

      <div className="p-6 pt-0 pb-5">
        <div className="flex flex-col bg-white shrink-0 px-3 py-3 gap-3 rounded-2xl border border-[#f0f0f0]" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.07), 0 1.5px 6px rgba(0,0,0,0.04)' }}>
          <AiInput
            value={prompt}
            onChange={setPrompt}
            onSend={handleSend}
            isDisabled={state.isLoading}
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

