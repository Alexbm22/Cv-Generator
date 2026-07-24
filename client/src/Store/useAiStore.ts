import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { sendCVEditMessage } from '../services/ai';
import { sanitizeHtml } from '../utils';
import {
  CVEditOperation,
  ConversationMessage,
  HistoryEntry,
} from '../interfaces/ai';
import {
  Language,
  Skill,
  WorkExperience,
  Education,
  Project,
  CustomSectionAttributes,
  SocialLink,
} from '../interfaces/cv';
import { useCvEditStore } from './useCvEditStore';
import { useAuthStore } from './useAuthStore';

export interface AiStore {
  conversation: ConversationMessage[];
  history: HistoryEntry[];
  pendingOperations: CVEditOperation[];
  isLoading: boolean;
  abortController: AbortController | null;

  sendMessage: (prompt: string) => Promise<void>;
  acceptAll: () => void;
  reject: () => void;
  reset: () => void;
  /** Apply a set of operations directly to the CV store without touching pendingOperations. */
  applyOperations: (ops: CVEditOperation[]) => void;
}

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
                jobTitle: String(item.jobTitle ?? ''),
                company: String(item.company ?? ''),
                startDate: parseDate(item.startDate),
                endDate: parseDate(item.endDate),
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
                startDate: parseDate(item.startDate),
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
            case 'jobDescription': store.setJobDescription(op.newValue); break;
            case 'companyName': store.setCompanyName(op.newValue); break;
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

export const useAiStore = create<AiStore>()(
  devtools<AiStore>(
    (set, get) => ({
      conversation: [],
      history: [],
      pendingOperations: [],
      isLoading: false,
      abortController: null,

      sendMessage: async (prompt: string) => {
        const trimmedPrompt = prompt.trim();
        if (!trimmedPrompt || get().isLoading) return;

        const userMsg: ConversationMessage = {
          id: uuidv4(),
          role: 'user',
          content: trimmedPrompt,
        };

        const controller = new AbortController();

        set((state) => ({
          isLoading: true,
          abortController: controller,
          conversation: [...state.conversation, userMsg],
        }));

        const { history, pendingOperations } = get();
        const { isAuthenticated } = useAuthStore.getState();
        const cvEditStore = useCvEditStore.getState();
        const cvId = cvEditStore.id;

        const baseParams = {
          prompt: trimmedPrompt,
          history,
          pendingOperations,
          signal: controller.signal,
        };

        const params =
          isAuthenticated && cvId
            ? { ...baseParams, cvId }
            : {
                ...baseParams,
                cvData: cvEditStore.getGuestCVAIData(),
                jobData: cvEditStore.getJobData(),
              };

        try {
          const { operations, message, history: newHistory } = await sendCVEditMessage(params);

          set((state) => ({
            pendingOperations: operations,
            history: newHistory,
            conversation: [
              ...state.conversation,
              { id: uuidv4(), role: 'assistant' as const, content: message } satisfies ConversationMessage,
            ],
          }));
        } catch (err: unknown) {
          const isAbort = err instanceof DOMException && err.name === 'AbortError';
          if (!isAbort) {
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
            set((state) => ({
              conversation: [
                ...state.conversation,
                {
                  id: uuidv4(),
                  role: 'assistant' as const,
                  content: `Error: ${errorMessage}`,
                } satisfies ConversationMessage,
              ],
            }));
          }
        } finally {
          set({ isLoading: false, abortController: null });
        }
      },

      acceptAll: () => {
        const { pendingOperations, isLoading } = get();
        if (pendingOperations.length === 0 || isLoading) return;
        applyAIOperations(pendingOperations);
        set({ pendingOperations: [] });
      },

      reject: () => {
        const { pendingOperations, isLoading } = get();
        if (pendingOperations.length === 0 || isLoading) return;
        set({ pendingOperations: [] });
      },

      reset: () => {
        const { abortController } = get();
        abortController?.abort();
        set({
          conversation: [],
          history: [],
          pendingOperations: [],
          isLoading: false,
          abortController: null,
        });
      },

      applyOperations: (ops: CVEditOperation[]) => {
        if (ops.length === 0) return;
        applyAIOperations(ops);
      },
    }),
    {
      name: 'ai-store',
      enabled: import.meta.env.VITE_NODE_ENV === 'development',
    },
  ),
);
