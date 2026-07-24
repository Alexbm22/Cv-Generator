import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AlertCircle, Languages, RefreshCw, X } from 'lucide-react';
import { useCvEditStore, useAiStore } from '../../Store';
import { LANGUAGE_TO_FLAG } from '../../constants/CV/languageFlagMap';
import type { CVLanguage } from '../../interfaces/cv';
import type { CVEditOperation, TranslateResponse } from '../../interfaces/ai';
import { translateCV } from '../../services/ai';
import AICVDiffViewer from './TextEditor/AiAssistant/AICVDiffViewer';

// ── Types ─────────────────────────────────────────────────────────────────────

type DialogPhase = 'loading' | 'success' | 'empty' | 'error';

interface CVTranslationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    targetLanguage: CVLanguage | null;
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

const LoadingState: React.FC = () => (
    <div className="flex flex-col items-center justify-center gap-4 py-10 px-6 text-center">
        <div className="relative flex items-center justify-center w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-blue-100" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
            <Languages className="w-5 h-5 text-blue-500" />
        </div>
        <div className="flex flex-col gap-1">
            <p className="text-[14px] font-semibold text-gray-900">Translating your CV…</p>
            <p className="text-[12px] text-gray-500 max-w-xs leading-relaxed">
                AI is rewriting your CV content. This may take a moment.
            </p>
        </div>
        {/* Shimmer rows */}
        <div className="w-full flex flex-col gap-2 mt-2">
            {[80, 60, 72, 50].map((w, i) => (
                <div
                    key={i}
                    className="h-3 rounded-full bg-gray-100 animate-pulse"
                    style={{ width: `${w}%`, animationDelay: `${i * 120}ms` }}
                />
            ))}
        </div>
    </div>
);

// ── Empty state ───────────────────────────────────────────────────────────────

const EmptyState: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => (
    <div className="flex flex-col items-center justify-center gap-4 py-10 px-6 text-center">
        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
            <Languages className="w-5 h-5 text-green-500" />
        </div>
        <div className="flex flex-col gap-1">
            <p className="text-[14px] font-semibold text-gray-900">No changes needed</p>
            <p className="text-[13px] text-gray-500 leading-relaxed max-w-xs">{message}</p>
        </div>
        <button
            type="button"
            onClick={onClose}
            className="mt-1 w-full py-2.5 rounded-[13px] bg-black/[0.06] hover:bg-black/[0.09] active:bg-black/[0.12] text-gray-800 text-[15px] font-medium tracking-tight transition-colors duration-150 cursor-pointer"
        >
            Done
        </button>
    </div>
);

// ── Error state ───────────────────────────────────────────────────────────────

const ErrorState: React.FC<{ message: string; onRetry: () => void; onClose: () => void }> = ({
    message,
    onRetry,
    onClose,
}) => (
    <div className="flex flex-col items-center justify-center gap-4 py-10 px-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-500" />
        </div>
        <div className="flex flex-col gap-1">
            <p className="text-[14px] font-semibold text-gray-900">Translation failed</p>
            <p className="text-[13px] text-gray-500 leading-relaxed max-w-xs">{message}</p>
        </div>
        <div className="flex flex-col gap-2 w-full mt-1">
            <button
                type="button"
                onClick={onRetry}
                className="w-full py-2.5 rounded-[13px] bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-[15px] font-semibold tracking-tight transition-colors duration-150 cursor-pointer flex items-center justify-center gap-2"
            >
                <RefreshCw className="w-4 h-4" />
                Try again
            </button>
            <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-[13px] bg-black/[0.06] hover:bg-black/[0.09] active:bg-black/[0.12] text-gray-800 text-[15px] font-medium tracking-tight transition-colors duration-150 cursor-pointer"
            >
                Cancel
            </button>
        </div>
    </div>
);

// ── Main component ────────────────────────────────────────────────────────────

const CVTranslationDialog: React.FC<CVTranslationDialogProps> = ({ isOpen, onClose, targetLanguage }) => {
    const [phase, setPhase] = useState<DialogPhase>('loading');
    const [operations, setOperations] = useState<CVEditOperation[]>([]);
    const [emptyMessage, setEmptyMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const cvId = useCvEditStore((s) => s.id);
    const applyOperations = useAiStore((s) => s.applyOperations);

    const setLanguage = useCvEditStore((state) => state.setLanguage);

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

    const langInfo = targetLanguage ? LANGUAGE_TO_FLAG[targetLanguage] : null;

    // Abort controller ref for cleanup
    const abortRef = useRef<AbortController | null>(null);

    const runTranslation = useCallback(async () => {
        if (!targetLanguage || !cvId) {
            setPhase('error');
            setErrorMessage('Missing CV or target language. Please try again.');
            return;
        }

        // Cancel any in-flight request
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setPhase('loading');
        setOperations([]);
        setEmptyMessage('');
        setErrorMessage('');

        let response: TranslateResponse;
        try {
            response = await translateCV({ cvId, targetLanguage });
            setLanguage(targetLanguage); // Update the CV language in the store if translation is successful
        } catch (err) {
            if (controller.signal.aborted) return;
            const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
            setPhase('error');
            setErrorMessage(msg);
            return;
        }

        if (controller.signal.aborted) return;

        if ('error' in response) {
            setPhase('error');
            setErrorMessage(response.error);
            return;
        }

        if (response.operations.length === 0) {
            setPhase('empty');
            setEmptyMessage(
                response.message ??
                'No changes were needed — your CV content is already in the target language.',
            );
            return;
        }

        setOperations(response.operations as CVEditOperation[]);
        setPhase('success');
    }, [targetLanguage, cvId]);

    // Fire translation as soon as the dialog opens
    useEffect(() => {
        if (isOpen) {
            runTranslation();
        }
        return () => {
            abortRef.current?.abort();
        };
    }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps
    // runTranslation is intentionally omitted — we only want to fire on open, not on every re-render

    const handleAcceptAll = useCallback(() => {
        applyOperations(operations);
        onClose();
    }, [applyOperations, operations, onClose]);

    const handleReject = useCallback(() => {
        onClose();
    }, [onClose]);

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <Dialog.Content
                    className={[
                        'fixed z-[70] bg-white/95 backdrop-blur-xl focus:outline-none',
                        'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
                        'w-[calc(100vw-48px)] max-w-[480px]',
                        'rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.22),0_4px_16px_rgba(0,0,0,0.10)]',
                        'data-[state=open]:animate-in data-[state=closed]:animate-out',
                        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                    ].join(' ')}
                    // Prevent dismissing while loading to avoid orphaned state
                    onInteractOutside={(e) => phase === 'loading' && e.preventDefault()}
                    onEscapeKeyDown={(e) => phase === 'loading' && e.preventDefault()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06]">
                        <Dialog.Title className="flex items-center gap-2 text-[15px] font-semibold text-gray-900 tracking-tight">
                            <Languages className="w-[18px] h-[18px] text-blue-500 flex-shrink-0" />
                            Translate CV content
                            {langInfo && (
                                <span className="flex items-center gap-1.5 ml-1">
                                    <span className="text-gray-400 font-normal">→</span>
                                    <img
                                        src={langInfo.svg}
                                        alt={langInfo.label}
                                        className="w-5 h-[14px] rounded-[2px] object-cover shadow-[0_1px_2px_rgba(0,0,0,0.15)]"
                                    />
                                    <span className="text-[13px] text-gray-700">{langInfo.label}</span>
                                </span>
                            )}
                        </Dialog.Title>
                        {phase !== 'loading' && (
                            <Dialog.Close asChild>
                                <button
                                    className="rounded-full p-1.5 text-gray-400 hover:bg-black/[0.06] hover:text-gray-600 transition-colors cursor-pointer"
                                    aria-label="Close"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </Dialog.Close>
                        )}
                    </div>

                    {/* Body */}
                    <div className="px-4 pb-4">
                        {phase === 'loading' && <LoadingState />}

                        {phase === 'empty' && (
                            <EmptyState message={emptyMessage} onClose={onClose} />
                        )}

                        {phase === 'error' && (
                            <ErrorState
                                message={errorMessage}
                                onRetry={runTranslation}
                                onClose={onClose}
                            />
                        )}

                        {phase === 'success' && operations.length > 0 && (
                            <div className="flex flex-col gap-3 pt-4">
                                <Dialog.Description className="text-[13px] text-gray-500 leading-relaxed">
                                    Review the proposed translations below. Accept all changes to apply
                                    them to your CV, or reject to discard.
                                </Dialog.Description>
                                <AICVDiffViewer
                                    operations={operations}
                                    currentItems={currentItems}
                                    onAcceptAll={handleAcceptAll}
                                    onReject={handleReject}
                                    size="medium"
                                />
                            </div>
                        )}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default CVTranslationDialog;
