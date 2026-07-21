import React, { useCallback, useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Globe, X } from 'lucide-react';
import { useCvEditStore } from '../../Store';
import { useAuthStore } from '../../Store/useAuthStore';
import { LANGUAGE_TO_FLAG } from '../../constants/CV/languageFlagMap';
import type { CVLanguage } from '../../interfaces/cv';
import { CVServerService } from '../../services/CVServer';
import CVTranslationDialog from './CVTranslationDialog';

interface CVLanguageDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const LANGUAGES = Object.entries(LANGUAGE_TO_FLAG) as [CVLanguage, { svg: string; label: string }][];

// ─── Radio indicator ──────────────────────────────────────────────────────────
const RadioDot: React.FC<{ selected: boolean }> = ({ selected }) => (
    <span
        className="flex-shrink-0 flex items-center justify-center"
        style={{ width: 20, height: 20 }}
    >
        <span
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 20,
                height: 20,
                borderRadius: '50%',
                border: selected ? '2px solid #3b82f6' : '2px solid #c7c7cc',
                backgroundColor: selected ? '#3b82f6' : 'transparent',
                transition: 'background-color 180ms ease-out, border-color 180ms ease-out',
            }}
        >
            {selected && (
                <span
                    style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        backgroundColor: '#fff',
                        transition: 'transform 180ms ease-out',
                        transform: 'scale(1)',
                    }}
                />
            )}
        </span>
    </span>
);

// ─── Confirmation alert dialog ────────────────────────────────────────────────
interface ConfirmDialogProps {
    isOpen: boolean;
    targetLanguage: CVLanguage | null;
    onCancel: () => void;
    onConfirm: () => void;
}

const ConfirmTranslateDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    targetLanguage,
    onCancel,
    onConfirm,
}) => {
    const langInfo = targetLanguage ? LANGUAGE_TO_FLAG[targetLanguage] : null;
    if (!langInfo) return null;

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onCancel()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <Dialog.Content
                    className={[
                        'fixed z-[70] bg-white/95 backdrop-blur-xl focus:outline-none',
                        'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
                        'w-[calc(100vw-48px)] max-w-[450px]',
                        'rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.22),0_4px_16px_rgba(0,0,0,0.10)]',
                        'data-[state=open]:animate-in data-[state=closed]:animate-out',
                        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                    ].join(' ')}
                >
                    {/* Icon + Title */}
                    <div className="flex flex-col items-center px-5 pt-6 pb-3 text-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-1">
                            <Globe className="w-6 h-6 text-blue-500" />
                        </div>
                        <Dialog.Title className="text-[17px] font-semibold text-gray-900 tracking-tight leading-snug">
                            Translate CV to {langInfo?.label}?
                        </Dialog.Title>
                        <Dialog.Description className="text-[14px] text-gray-500 font-normal leading-relaxed mb-2 mt-2">
                            AI will rewrite the <span className="font-medium text-gray-700">entire CV content</span> in {langInfo?.label}. This may alter phrasing and wording, even within the same meaning
                        </Dialog.Description>
                        <p className="text-[12px] text-gray-400 leading-relaxed">
                            To change the template language (labels), use the <span className="font-medium text-gray-500">Template</span> tab instead.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 px-4 pb-4 pt-2">
                        <button
                            type="button"
                            onClick={onConfirm}
                            className="w-full py-2.5 rounded-[13px] bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-[15px] font-semibold tracking-tight shadow-[0_1px_4px_rgba(59,130,246,0.35)] transition-colors duration-150 cursor-pointer"
                        >
                            Translate CV
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="w-full py-2.5 rounded-[13px] bg-black/[0.06] hover:bg-black/[0.09] active:bg-black/[0.12] text-gray-800 text-[15px] font-medium tracking-tight transition-colors duration-150 cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

// ─── Main dialog ──────────────────────────────────────────────────────────────
const CVLanguageDialog: React.FC<CVLanguageDialogProps> = ({ isOpen, onClose }) => {
    const [detectedLanguage, setDetectedLanguage] = useState<CVLanguage | null>(null);
    const setDetectedLanguageStore = useCvEditStore((s) => s.setDetectedLanguage);

    const cvId = useCvEditStore((s) => s.id);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    // Local selection state — does NOT immediately commit to store
    const [selectedLanguage, setSelectedLanguage] = useState<CVLanguage | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);

    const [showTranslationDialog, setShowTranslationDialog] = useState(false);
    const [translationTargetLanguage, setTranslationTargetLanguage] = useState<CVLanguage | null>(null);

    useEffect(() => {
        if (isOpen) {
            setSelectedLanguage(null);
            setShowTranslationDialog(false);
            setShowConfirm(false);
            setTranslationTargetLanguage(null);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || !isAuthenticated || !cvId) return;
        CVServerService.detectLanguage(cvId)
            .then(({ language: detected }) => {
                if (detected) {
                    setDetectedLanguage(detected);
                    setDetectedLanguageStore(detected);
                }
            })
            .catch(() => { /* silently ignore */ });
    }, [isOpen, isAuthenticated, cvId, setDetectedLanguageStore]);

    useEffect(() => {
        if (!isOpen) {
            setDetectedLanguage(null);
            setShowConfirm(false);
        }
    }, [isOpen]);

    // Selecting a language in the list: updates local state only
    const handleSelect = useCallback((lang: CVLanguage) => {
        setSelectedLanguage(lang);
    }, []);

    // "Translate" button → open confirmation dialog
    const handleTranslateClick = useCallback(() => {
        setShowConfirm(true);
    }, []);

    // Confirm: open translation dialog (do NOT call onClose — translation dialog closes the whole flow)
    const handleConfirm = useCallback(() => {
        if (!selectedLanguage) return;
        setTranslationTargetLanguage(selectedLanguage);
        setShowConfirm(false);
        setShowTranslationDialog(true);
    }, [selectedLanguage]);

    // Cancel confirmation → return to language selector with selection preserved
    const handleCancelConfirm = useCallback(() => {
        setShowConfirm(false);
    }, []);

    // Translation dialog closed (accepted, rejected, or dismissed) → close entire flow
    const handleTranslationClose = useCallback(() => {
        setShowTranslationDialog(false);
        setTranslationTargetLanguage(null);
        onClose();
    }, [onClose]);

    return (
        <>
            <Dialog.Root open={isOpen && !showConfirm} onOpenChange={(open) => !open && onClose()}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-xs z-[60] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

                    <Dialog.Content
                        className={[
                            'fixed z-[60] bg-white/90 backdrop-blur-xl focus:outline-none',
                            // desktop: centered, compact width
                            'sm:left-1/2 sm:top-1/2 sm:w-[400px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl',
                            // mobile: bottom sheet
                            'max-sm:bottom-0 max-sm:left-0 max-sm:right-0 max-sm:rounded-t-2xl max-sm:rounded-b-none',
                            // shadow
                            'shadow-[0_20px_60px_rgba(0,0,0,0.18)]',
                            // animations
                            'data-[state=open]:animate-in data-[state=closed]:animate-out',
                            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                            'sm:data-[state=closed]:slide-out-to-left-1/2 sm:data-[state=closed]:slide-out-to-top-1/2',
                            'sm:data-[state=open]:slide-in-from-left-1/2 sm:data-[state=open]:slide-in-from-top-1/2',
                            'max-sm:data-[state=open]:slide-in-from-bottom-full max-sm:data-[state=closed]:slide-out-to-bottom-full',
                        ].join(' ')}
                    >
                        {/* Drag handle (mobile only) */}
                        <div className="flex justify-center pt-3 pb-1 sm:hidden">
                            <div className="w-9 h-1 rounded-full bg-black/20" />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06]">
                            <Dialog.Title className="flex items-center gap-2 text-base font-semibold text-gray-900 tracking-tight">
                                <Globe className="w-[18px] h-[18px] text-blue-500 flex-shrink-0" />
                                CV Language
                            </Dialog.Title>
                            <Dialog.Close asChild>
                                <button
                                    className="rounded-full p-1.5 text-gray-400 hover:bg-black/[0.06] hover:text-gray-600 transition-colors cursor-pointer"
                                    aria-label="Close"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </Dialog.Close>
                        </div>

                        {/* Language list */}
                        <div className="py-4 px-4 flex flex-col gap-1 max-h-[60dvh] overflow-y-auto">
                            {LANGUAGES.map(([code, { svg, label }]) => {
                                const isSelected = selectedLanguage === code;
                                const isDetected = detectedLanguage === code;

                                return (
                                    <button
                                        key={code}
                                        type="button"
                                        onClick={() => handleSelect(code)}
                                        className={[
                                            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors duration-100',
                                            isSelected
                                                ? 'bg-[#e5eeff]'
                                                : 'hover:bg-black/[0.04]',
                                        ].join(' ')}
                                    >
                                        <img
                                            src={svg}
                                            alt={label}
                                            className="w-7 h-[20px] rounded-[3px] object-cover flex-shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.15)]"
                                        />
                                        <span
                                            className={[
                                                'flex-1 text-left text-sm inline-flex items-center gap-2',
                                                isSelected
                                                    ? 'font-semibold text-blue-600'
                                                    : 'font-medium text-gray-800',
                                            ].join(' ')}
                                        >
                                            {label}
                                            
                                            {isDetected && (
                                                <span className="text-xs text-gray-500">(Detected)</span>
                                            )}
                                        </span>
                                        <RadioDot selected={isSelected} />
                                    </button>
                                );
                            })}
                        </div>

                        {/* Footer — translate action */}
                        <div className="px-4 pt-2 pb-4 flex flex-col gap-1.5">
                            <button
                                type="button"
                                onClick={handleTranslateClick}
                                disabled={!selectedLanguage}
                                className={[
                                    'w-full py-2.5 rounded-[13px] text-[15px] font-semibold tracking-tight transition-all duration-150 flex items-center justify-center gap-2',
                                    !selectedLanguage
                                        ? 'bg-black/[0.05] text-gray-300 cursor-not-allowed'
                                        : 'bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white shadow-[0_2px_8px_rgba(59,130,246,0.30)] cursor-pointer',
                                ].join(' ')}
                            >
                                <Globe className="w-4 h-4" />
                                Translate CV
                            </button>
                            {!selectedLanguage && (
                                <p className="text-center text-[12px] text-gray-400">
                                    Select a language to translate
                                </p>
                            )}
                        </div>

                        {/* Bottom safe area for mobile */}
                        <div className="h-safe-bottom pb-2 sm:pb-0" />
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            <ConfirmTranslateDialog
                isOpen={showConfirm}
                targetLanguage={selectedLanguage}
                onCancel={handleCancelConfirm}
                onConfirm={handleConfirm}
            />

            <CVTranslationDialog
                isOpen={showTranslationDialog}
                onClose={handleTranslationClose}
                targetLanguage={translationTargetLanguage}
            />
        </>
    );
};

export default CVLanguageDialog;
