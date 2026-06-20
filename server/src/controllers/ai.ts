import { Response, Request } from 'express';
import { AuthRequest } from '../interfaces/auth';
import { aiGuestRequestSchema, aiProtectedRequestSchema, aiAboutMeProtectedRequestSchema, aiAboutMeGuestRequestSchema } from '../validators/ai_validators';
import { optimizeHistory } from '../services/ai/tokenOptimizer';
import { callSectionEditAI, callCVEditAI, callAboutMeEditAI } from '../services/ai/chat';
import { HistoryEntry } from '../interfaces/ai';
import { CVsService } from '@/services/cv';

export const AiController = {
  ProtectedChat: async (req: AuthRequest, res: Response): Promise<void> => {
    const parsed = aiProtectedRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid request', errors: parsed.error.issues });
      return;
    }

    const { prompt, history, pendingOperations, pendingOperation, SectionData, CVId } = parsed.data;
    const { optimized } = await optimizeHistory(history);

    const controller = new AbortController();
    req.on('close', () => controller.abort());

    try {
      const { content, jobData } = await CVsService.getAiOptimizedCVContent(
        req.user.get().id,
        CVId,
        SectionData?.sectionType,
        SectionData?.contentId,
      );
      const currentContent = JSON.stringify(content);

      const updatedHistory: HistoryEntry[] = [
        ...optimized,
        { role: 'user', content: prompt },
      ];

      if (SectionData) {
        const aiResponse = await callSectionEditAI({
          prompt,
          history: optimized,
          sectionType: SectionData.sectionType,
          contentId: SectionData.contentId,
          currentContent,
          pendingOperation,
          jobData,
          signal: controller.signal,
        });

        updatedHistory.push({ role: 'assistant', content: aiResponse.message });

        res.status(200).json({
          operation: aiResponse.ItemEditOperation,
          message: aiResponse.message,
          history: updatedHistory,
        });
      } else {
        const aiResponse = await callCVEditAI({
          prompt,
          history: optimized,
          currentContent,
          pendingOperations,
          jobData,
          signal: controller.signal,
        });

        updatedHistory.push({ role: 'assistant', content: aiResponse.message });

        res.status(200).json({
          operations: aiResponse.CVEditOperations,
          message: aiResponse.message,
          history: updatedHistory,
        });
      }
    } catch (err: unknown) {
      const isAbort = err instanceof Error && err.name === 'AbortError';
      if (!isAbort) {
        res.status(500).json({ message: 'An error occurred while processing your request.' });
      }
    }
  },

  GuestChat: async (req: Request, res: Response): Promise<void> => {
    const parsed = aiGuestRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid request', errors: parsed.error.issues });
      return;
    }

    const { prompt, history, sectionData, cvData, pendingOperation, pendingOperations, jobData } = parsed.data;
    if (!cvData && !sectionData) {
      res.status(400).json({ message: 'Either cvData or sectionData must be provided.' });
      return;
    }

    const { optimized } = await optimizeHistory(history);

    const controller = new AbortController();
    req.on('close', () => controller.abort());

    try {
      const updatedHistory: HistoryEntry[] = [
        ...optimized,
        { role: 'user', content: prompt },
      ];

      // Section edit: a specific list item (workExperience, education, etc.)
      // aboutMe has no contentId and falls through to the CV edit path.
      if (sectionData && 'contentId' in sectionData) {
        const currentContent = JSON.stringify(sectionData.content);

        const aiResponse = await callSectionEditAI({
          prompt,
          history: optimized,
          sectionType: sectionData.sectionType,
          contentId: sectionData.contentId,
          currentContent,
          pendingOperation,
          jobData,
          signal: controller.signal,
        });

        updatedHistory.push({ role: 'assistant', content: aiResponse.message });

        res.status(200).json({
          operation: aiResponse.ItemEditOperation,
          message: aiResponse.message,
          history: updatedHistory,
        });
      } else {
        // Full CV edit, or scalar field edit (e.g. aboutMe).
        // Wrap aboutMe in an object so the AI can target it with set_field.
        const currentContent = sectionData
          ? JSON.stringify({ [sectionData.sectionType]: sectionData.content })
          : JSON.stringify(cvData);

        const aiResponse = await callCVEditAI({
          prompt,
          history: optimized,
          currentContent,
          pendingOperations,
          jobData,
          signal: controller.signal,
        });

        updatedHistory.push({ role: 'assistant', content: aiResponse.message });

        res.status(200).json({
          operations: aiResponse.CVEditOperations,
          message: aiResponse.message,
          history: updatedHistory,
        });
      }
    } catch (err: unknown) {
      console.error('Error in GuestChat:', err);
      const isAbort = err instanceof Error && err.name === 'AbortError';
      if (!isAbort) {
        res.status(500).json({ message: 'An error occurred while processing your request.' });
      }
    }
  },

  // ── About Me ──────────────────────────────────────────────────────────────

  ProtectedAboutMeChat: async (req: AuthRequest, res: Response): Promise<void> => {
    const parsed = aiAboutMeProtectedRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid request', errors: parsed.error.issues });
      return;
    }

    const { prompt, history, CVId, pendingTextChange } = parsed.data;
    const { optimized } = await optimizeHistory(history);

    const controller = new AbortController();
    req.on('close', () => controller.abort());

    try {
      const cv = await CVsService.getCVWithMediaFiles(req.user.get().id, CVId);
      if (!cv) {
        res.status(404).json({ message: 'CV not found.' });
        return;
      }
      const currentText: string = cv.get().content?.aboutMe ?? '';

      const updatedHistory: HistoryEntry[] = [
        ...optimized,
        { role: 'user', content: prompt },
      ];

      const aiResponse = await callAboutMeEditAI({
        prompt,
        history: optimized,
        currentText,
        pendingTextChange,
        signal: controller.signal,
      });

      updatedHistory.push({ role: 'assistant', content: aiResponse.message });

      res.status(200).json({
        setAboutMe: aiResponse.setAboutMe,
        message: aiResponse.message,
        history: updatedHistory,
      });
    } catch (err: unknown) {
      const isAbort = err instanceof Error && err.name === 'AbortError';
      if (!isAbort) {
        res.status(500).json({ message: 'An error occurred while processing your request.' });
      }
    }
  },

  GuestAboutMeChat: async (req: Request, res: Response): Promise<void> => {
    const parsed = aiAboutMeGuestRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid request', errors: parsed.error.issues });
      return;
    }

    const { prompt, history, currentText, pendingTextChange, jobData } = parsed.data;
    const { optimized } = await optimizeHistory(history);

    const controller = new AbortController();
    req.on('close', () => controller.abort());

    try {
      const updatedHistory: HistoryEntry[] = [
        ...optimized,
        { role: 'user', content: prompt },
      ];

      const aiResponse = await callAboutMeEditAI({
        prompt,
        history: optimized,
        currentText,
        pendingTextChange,
        jobData,
        signal: controller.signal,
      });

      updatedHistory.push({ role: 'assistant', content: aiResponse.message });

      res.status(200).json({
        setAboutMe: aiResponse.setAboutMe,
        message: aiResponse.message,
        history: updatedHistory,
      });
    } catch (err: unknown) {
      console.error('Error in GuestAboutMeChat:', err);
      const isAbort = err instanceof Error && err.name === 'AbortError';
      if (!isAbort) {
        res.status(500).json({ message: 'An error occurred while processing your request.' });
      }
    }
  },
};
