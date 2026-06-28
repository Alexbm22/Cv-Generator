import React, { useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Check, X } from 'lucide-react';
import { useCvEditStore } from '../../Store';
import { LANGUAGE_TO_FLAG } from '../../constants/CV/languageFlagMap';
import type { CVLanguage } from '../../interfaces/cv';

interface CVLanguageDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const LANGUAGES = Object.entries(LANGUAGE_TO_FLAG) as [CVLanguage, { svg: string; label: string }][];

const CVLanguageDialog: React.FC<CVLanguageDialogProps> = ({ isOpen, onClose }) => {
    const language = useCvEditStore((s) => s.language);
    const setLanguage = useCvEditStore((s) => s.setLanguage);

    const handleSelect = useCallback(
        (lang: CVLanguage) => {
            setLanguage(lang);
        },
        [setLanguage],
    );

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
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
                        <Dialog.Title className="text-base font-semibold text-gray-900 tracking-tight">
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
                    <div className="py-4 px-4 flex flex-col gap-1 max-h-[70dvh] overflow-y-auto">
                        {LANGUAGES.map(([code, { svg, label }]) => {
                            const isSelected = language === code;
                            return (
                                <button
                                    key={code}
                                    type="button"
                                    onClick={() => handleSelect(code)}
                                    className={[
                                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors duration-100',
                                        isSelected
                                            ? 'bg-blue-50'
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
                                            'flex-1 text-left text-sm',
                                            isSelected
                                                ? 'font-semibold text-blue-600'
                                                : 'font-medium text-gray-800',
                                        ].join(' ')}
                                    >
                                        {label}
                                    </span>
                                    {isSelected && (
                                        <Check className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Bottom safe area for mobile */}
                    <div className="h-safe-bottom pb-2 sm:pb-0" />
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default CVLanguageDialog;
