import { Response, Request, NextFunction } from 'express';
import { AuthRequest } from '../interfaces/auth';
import { aiGuestRequestSchema, aiProtectedRequestSchema, aiAboutMeProtectedRequestSchema, aiAboutMeGuestRequestSchema, aiProtectedTranslateCVRequestSchema, aiGuestTranslateCVRequestSchema } from '../validators/ai_validators';
import { optimizeHistory } from '../services/ai/tokenOptimizer';
import { callSectionEditAI, callCVEditAI, callAboutMeEditAI } from '../services/ai/chat';
import { runMeteredAiCall } from '../services/ai/aiUsage';
import { getAiAccess } from '../middleware/ai_usage_middleware';
import { AppError } from '../middleware/error_middleware';
import { HistoryEntry } from '../interfaces/ai';
import { CVsService } from '@/services/cv';

// AppError goes to the error handler for its status; aborted requests get no response.
const respondWithError = (err: unknown, res: Response, next: NextFunction): void => {
  if (err instanceof AppError) {
    next(err);
    return;
  }
  if (err instanceof Error && err.name === 'AbortError') return;

  console.error('AI request failed:', err);
  res.status(500).json({ message: 'An error occurred while processing your request.' });
};

export const AiController = {
  ProtectedChat: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const parsed = aiProtectedRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid request', errors: parsed.error.issues });
      return;
    }

    const { prompt, history, pendingOperations, pendingOperation, SectionData, CVId } = parsed.data;

    const controller = new AbortController();
    req.on('close', () => controller.abort());

    try {
      const access = getAiAccess(res);
      const { optimized } = await optimizeHistory(history);
      const { content, jobData } = SectionData
        ? await CVsService.getCVSectionContext(req.user.get().id, CVId, SectionData.sectionType, SectionData.contentId)
        : await CVsService.getFullCVContext(req.user.get().id, CVId);
      const currentContent = JSON.stringify(content);

      const updatedHistory: HistoryEntry[] = [
        ...optimized,
        { role: 'user', content: prompt },
      ];

      if (SectionData) {
        const { value: aiResponse, usageNotice } = await runMeteredAiCall({
          access,
          signal: controller.signal,
          estimate: (estimator) => estimator.estimateEdit(optimized, prompt, currentContent),
          run: (call) => callSectionEditAI({
            ...call,
            prompt,
            history: optimized,
            sectionType: SectionData.sectionType,
            contentId: SectionData.contentId,
            currentContent,
            pendingOperation,
            jobData,
          }),
        });

        updatedHistory.push({ role: 'assistant', content: aiResponse.message });

        res.status(200).json({
          operation: aiResponse.ItemEditOperation,
          message: aiResponse.message,
          history: updatedHistory,
          usageNotice,
        });
      } else {
        const { value: aiResponse, usageNotice } = await runMeteredAiCall({
          access,
          signal: controller.signal,
          estimate: (estimator) => estimator.estimateEdit(optimized, prompt, currentContent),
          run: (call) => callCVEditAI({
            ...call,
            prompt,
            history: optimized,
            currentContent,
            pendingOperations,
            jobData,
          }),
        });

        updatedHistory.push({ role: 'assistant', content: aiResponse.message });

        res.status(200).json({
          operations: aiResponse.CVEditOperations,
          message: aiResponse.message,
          history: updatedHistory,
          usageNotice,
        });
      }
    } catch (err: unknown) {
      respondWithError(err, res, next);
    }
  },

  GuestChat: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
      const access = getAiAccess(res);
      const updatedHistory: HistoryEntry[] = [
        ...optimized,
        { role: 'user', content: prompt },
      ];

      // Section edit: a specific list item (workExperience, education, etc.)
      // aboutMe has no contentId and falls through to the CV edit path.
      if (sectionData && 'contentId' in sectionData) {
        const currentContent = JSON.stringify(sectionData.content);

        const { value: aiResponse, usageNotice } = await runMeteredAiCall({
          access,
          signal: controller.signal,
          estimate: (estimator) => estimator.estimateEdit(optimized, prompt, currentContent),
          run: (call) => callSectionEditAI({
            ...call,
            prompt,
            history: optimized,
            sectionType: sectionData.sectionType,
            contentId: sectionData.contentId,
            currentContent,
            pendingOperation,
            jobData,
          }),
        });

        updatedHistory.push({ role: 'assistant', content: aiResponse.message });

        res.status(200).json({
          operation: aiResponse.ItemEditOperation,
          message: aiResponse.message,
          history: updatedHistory,
          usageNotice,
        });
      } else {
        // Full CV edit, or scalar field edit (e.g. aboutMe).
        // Wrap aboutMe in an object so the AI can target it with set_field.
        const currentContent = sectionData
          ? JSON.stringify({ [sectionData.sectionType]: sectionData.content })
          : JSON.stringify(cvData);

        const { value: aiResponse, usageNotice } = await runMeteredAiCall({
          access,
          signal: controller.signal,
          estimate: (estimator) => estimator.estimateEdit(optimized, prompt, currentContent),
          run: (call) => callCVEditAI({
            ...call,
            prompt,
            history: optimized,
            currentContent,
            pendingOperations,
            jobData,
          }),
        });

        updatedHistory.push({ role: 'assistant', content: aiResponse.message });

        res.status(200).json({
          operations: aiResponse.CVEditOperations,
          message: aiResponse.message,
          history: updatedHistory,
          usageNotice,
        });
      }
    } catch (err: unknown) {
      respondWithError(err, res, next);
    }
  },

  ProtectedAboutMeChat: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const parsed = aiAboutMeProtectedRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid request', errors: parsed.error.issues });
      return;
    }

    const { prompt, history, CVId, pendingTextChange } = parsed.data;

    const controller = new AbortController();
    req.on('close', () => controller.abort());

    try {
      const access = getAiAccess(res);
      const { optimized } = await optimizeHistory(history);
      const context = await CVsService.getAboutMeAiContext(req.user.get().id, CVId);
      if (!context) {
        res.status(404).json({ message: 'CV not found.' });
        return;
      }

      const updatedHistory: HistoryEntry[] = [
        ...optimized,
        { role: 'user', content: prompt },
      ];

      const { value: aiResponse, usageNotice } = await runMeteredAiCall({
        access,
        signal: controller.signal,
        estimate: (estimator) => estimator.estimateEdit(optimized, prompt, context.currentText),
        run: (call) => callAboutMeEditAI({
          ...call,
          prompt,
          history: optimized,
          currentText: context.currentText,
          pendingTextChange,
          jobData: context.jobData,
        }),
      });

      updatedHistory.push({ role: 'assistant', content: aiResponse.message });

      res.status(200).json({
        setAboutMe: aiResponse.setAboutMe,
        message: aiResponse.message,
        history: updatedHistory,
        usageNotice,
      });
    } catch (err: unknown) {
      respondWithError(err, res, next);
    }
  },

  GuestAboutMeChat: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const parsed = aiAboutMeGuestRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid request', errors: parsed.error.issues });
      return;
    }

    const { prompt, history, currentText, pendingTextChange, jobData } = parsed.data;

    const controller = new AbortController();
    req.on('close', () => controller.abort());

    try {
      const access = getAiAccess(res);
      const { optimized } = await optimizeHistory(history);
      const updatedHistory: HistoryEntry[] = [
        ...optimized,
        { role: 'user', content: prompt },
      ];

      const { value: aiResponse, usageNotice } = await runMeteredAiCall({
        access,
        signal: controller.signal,
        estimate: (estimator) => estimator.estimateEdit(optimized, prompt, currentText),
        run: (call) => callAboutMeEditAI({
          ...call,
          prompt,
          history: optimized,
          currentText,
          pendingTextChange,
          jobData,
        }),
      });

      updatedHistory.push({ role: 'assistant', content: aiResponse.message });

      res.status(200).json({
        setAboutMe: aiResponse.setAboutMe,
        message: aiResponse.message,
        history: updatedHistory,
        usageNotice,
      });
    } catch (err: unknown) {
      respondWithError(err, res, next);
    }
  },

  ProtectedTranslate: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const parsed = aiProtectedTranslateCVRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid request', errors: parsed.error.issues });
      return;
    }

    const { CVId, targetLanguage } = parsed.data;

    const controller = new AbortController();
    req.on('close', () => controller.abort());

    try {
      const access = getAiAccess(res);
      const { content } = await CVsService.getFullCVContext(
        req.user.get().id, CVId
      );
      const currentContent = JSON.stringify(content);

      const { value: aiResponse, usageNotice } = await runMeteredAiCall({
        access,
        signal: controller.signal,
        estimate: (estimator) => estimator.estimateEdit([], targetLanguage, currentContent),
        run: (call) => CVsService.translateCVContent({ ...call, currentContent, targetLanguage }),
      });

      res.status(200).json({
        operations: aiResponse.CVEditOperations,
        message: aiResponse.message,
        usageNotice,
      });
    } catch (err: unknown) {
      respondWithError(err, res, next);
    }
  },

  GuestTranslate: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const parsed = aiGuestTranslateCVRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid request', errors: parsed.error.issues });
      return;
    }

    const { cvData, targetLanguage } = parsed.data;

    const controller = new AbortController();
    req.on('close', () => controller.abort());

    try {
      const access = getAiAccess(res);
      const currentContent = JSON.stringify(cvData);

      const { value: aiResponse, usageNotice } = await runMeteredAiCall({
        access,
        signal: controller.signal,
        estimate: (estimator) => estimator.estimateEdit([], targetLanguage, currentContent),
        run: (call) => CVsService.translateCVContent({ ...call, currentContent, targetLanguage }),
      });

      res.status(200).json({
        operations: aiResponse.CVEditOperations,
        message: aiResponse.message,
        usageNotice,
      });
    } catch (err: unknown) {
      respondWithError(err, res, next);
    }
  }
};
