import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Plus, X } from 'lucide-react';
import { useAuthStore, useCvEditStore } from '../../../../Store';
import { CVTemplates, type CVLanguage } from '../../../../interfaces/cv';
import { CV_COLOR_THEMES } from '../../../../constants/CV/CVEditor';
import { useUserPreferences } from '../../../../hooks/useUserPreferences';
import { LANGUAGE_TO_FLAG, getFlagFromLanguage } from '../../../../constants/CV/languageFlagMap';
import { CVServerService } from '../../../../services/CVServer';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TEMPLATE_LABELS: Record<CVTemplates, string> = {
    [CVTemplates.CASTOR]: 'Castor',
    [CVTemplates.POLARIS]: 'Polaris',
};

// Dynamically built from the enum — adding a new CVTemplates value + matching
// image in public/Images/template-previews/ is all that's needed.
const TEMPLATE_PREVIEW_SRC = (template: CVTemplates) =>
    `/Images/template-previews/${template}.png`;

const ALL_TEMPLATES = Object.values(CVTemplates);

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const LayoutIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-[#3b82f6]">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M3 9h18M9 21V9" />
    </svg>
);

const GlobeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-[#3b82f6]">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
);

const PaletteIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-[#0f6bff]">
        <circle cx="13.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        <circle cx="17.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
        <circle cx="8.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
        <circle cx="6.5" cy="12.5" r="1" fill="currentColor" stroke="none" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
);

interface SectionHeaderProps {
    iconBg: string;
    icon: React.ReactNode;
    title: string;
    subtitle: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ iconBg, icon, title, subtitle }) => (
    <div className="flex items-center gap-3.5 mb-4">
        <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shadow-sm flex-shrink-0`}>
            {icon}
        </div>
        <div>
            <h2 className="text-[15px] font-semibold text-gray-900 tracking-tight leading-snug">{title}</h2>
            <p className="text-[13px] text-gray-400 leading-snug mt-px">{subtitle}</p>
        </div>
    </div>
);

interface TemplateCardProps {
    template: CVTemplates;
    isSelected: boolean;
    onSelect: (template: CVTemplates) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, isSelected, onSelect }) => (
    <button
        onClick={() => onSelect(template)}
        aria-pressed={isSelected}
        aria-label={`Select ${TEMPLATE_LABELS[template]} template`}
        className={[
            'group relative flex flex-col items-center gap-2.5 rounded-2xl p-3 shrink-0',
            'transition-all duration-200 cursor-pointer focus:outline-none',
            'focus-visible:ring-2 focus-visible:ring-[#007dff] focus-visible:ring-offset-1',
            isSelected
                ? 'bg-white shadow-md ring-2 ring-[#007dff]'
                : 'bg-white/60 hover:bg-white hover:shadow-md ring-1 ring-gray-200/70',
        ].join(' ')}
        style={{ width: 248 }}
    >
        {isSelected && (
            <span className="absolute top-2 right-2 z-10 flex items-center justify-center w-5 h-5 rounded-full bg-[#007dff] shadow">
                <Check size={11} strokeWidth={3} className="text-white" />
            </span>
        )}

        <div className="rounded-xl overflow-hidden bg-gray-100 shadow-inner" style={{ width: 224, height: 'auto' }}>
            <img
                src={TEMPLATE_PREVIEW_SRC(template)}
                alt={`${TEMPLATE_LABELS[template]} template preview`}
                className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
                loading="lazy"
                draggable={false}
            />
        </div>

        <span className={[
            'text-xs font-semibold tracking-wide transition-colors duration-200',
            isSelected ? 'text-[#007dff]' : 'text-gray-500 group-hover:text-gray-700',
        ].join(' ')}>
            {TEMPLATE_LABELS[template]}
        </span>
    </button>
);

interface ColorSwatchProps {
    color: string;
    isSelected: boolean;
    onSelect: (color: string) => void;
    onDelete?: (color: string) => void;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ color, isSelected, onSelect, onDelete }) => (
    <div className="relative group/swatch">
        <button
            onClick={() => onSelect(color)}
            aria-pressed={isSelected}
            aria-label={`Select color ${color}`}
            title={color}
            className={[
                'w-8 h-8 rounded-full transition-all duration-200 cursor-pointer',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#007dff]',
                isSelected
                    ? 'scale-110 ring-2 ring-offset-2 ring-gray-400/60 shadow-md'
                    : 'hover:scale-110 ring-1 ring-gray-300/40 hover:shadow',
            ].join(' ')}
            style={{ backgroundColor: color }}
        >
            {isSelected && (
                <Check size={14} strokeWidth={3} className="m-auto text-white drop-shadow" />
            )}
        </button>
        {onDelete && (
            <button
                onClick={(e) => { e.stopPropagation(); onDelete(color); }}
                aria-label={`Delete color ${color}`}
                title={`Remove ${color}`}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-400 text-white flex items-center justify-center opacity-0 group-hover/swatch:opacity-100 transition-opacity duration-150 focus:outline-none z-10 shadow cursor-pointer"
            >
                <X size={8} strokeWidth={3} />
            </button>
        )}
    </div>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const LANGUAGES = Object.entries(LANGUAGE_TO_FLAG) as [CVLanguage, { svg: string; label: string }][];

const TemplateEditor: React.FC<{ isShowingPreview: boolean }> = ({ isShowingPreview }) => {
    const template = useCvEditStore((state) => state.template);
    const setTemplate = useCvEditStore((state) => state.setTemplate);
    const templateColor = useCvEditStore((state) => state.templateColor);
    const setTemplateColorTheme = useCvEditStore((state) => state.setTemplateColorTheme);
    const language = useCvEditStore((state) => state.language);
    const setLanguage = useCvEditStore((state) => state.setLanguage);

    const { preferences, error, updateCustomColors } = useUserPreferences();

    const [customColorInput, setCustomColorInput] = useState('#000000');
    const [showCustomPicker, setShowCustomPicker] = useState(false);
    const [showLanguageSelector, setShowLanguageSelector] = useState(false);
    const langListRef = useRef<HTMLDivElement>(null);

    const [detectedLanguage, setDetectedLanguage] = useState<CVLanguage | null>(null);
    const setDetectedLanguageStore = useCvEditStore((s) => s.setDetectedLanguage);  
    
    
    const cvId = useCvEditStore((s) => s.id);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    useEffect(() => {
        if (!showLanguageSelector || !isAuthenticated || !cvId) return;
        CVServerService.detectLanguage(cvId)
            .then(({ language: detected }) => {
                if (detected) {
                    setDetectedLanguage(detected);
                    setDetectedLanguageStore(detected);
                }
            })
            .catch(() => { /* silently ignore */ });
    }, [showLanguageSelector, isAuthenticated, cvId, detectedLanguage, setDetectedLanguage, setDetectedLanguageStore]);

    useEffect(() => {
        if (!showLanguageSelector) {
            setDetectedLanguage(null);
            return;
        }
    }, [showLanguageSelector]);

    const { svg: languageFlag, label: languageLabel } = getFlagFromLanguage(language);

    const [colors, setColors] = useState<string[]>(CV_COLOR_THEMES);

    const selectColor = useCallback((color: string) => {
        const isSelected = color === templateColor;

        if (isSelected) {
            setCustomColorInput(color);
            setShowCustomPicker(true);
        } else {
            setTemplateColorTheme(color);
        }
    }, [setTemplateColorTheme, templateColor]);

    const deleteCustomColor = useCallback(async (colorToDelete: string) => {
        if (preferences) {
            const updatedColors = preferences.customColors.filter((c) => c !== colorToDelete);
            await updateCustomColors(updatedColors);
            if (templateColor === colorToDelete) {
                setTemplateColorTheme(CV_COLOR_THEMES[0]);
            }
        }
    }, [preferences, updateCustomColors, templateColor, setTemplateColorTheme]);

    const addCustomColor = useCallback(async (newColor: string) => {
        if (colors.includes(newColor)) {
            selectColor(newColor);
        } else if (preferences) {
            const updatedColors = [...preferences.customColors, newColor];
            await updateCustomColors(updatedColors);
        }
        setTemplateColorTheme(newColor);
        setShowCustomPicker(false);
    }, [preferences, updateCustomColors, setTemplateColorTheme, colors, selectColor]);
    
    useEffect(() => {
        if (preferences && !error) {
            setColors([...CV_COLOR_THEMES, ...preferences.customColors]);
        }
    }, [preferences, error]);

    return (
        <div
            className="transition-all duration-1000 bg-[#f5f5f7] w-full shadow-lg z-0.5 overflow-y-auto"
            style={isShowingPreview ? { flexBasis: '56.25%' } : { flexBasis: '100%' }}
        >
            <div className="p-cv-editor-padding mr-auto flex flex-col gap-8">

                {/* ── Choose Template ─────────────────────────────────────── */}
                <section aria-label="Template selection">
                    <SectionHeader
                        iconBg="bg-white/50"
                        icon={<LayoutIcon />}
                        title="Choose Template"
                        subtitle="Select the layout for your CV."
                    />
                    <div className="flex flex-wrap gap-4">
                        {ALL_TEMPLATES.map((t) => (
                            <TemplateCard
                                key={t}
                                template={t}
                                isSelected={template === t}
                                onSelect={setTemplate}
                            />
                        ))}
                    </div>
                </section>

                {/* ── Template Language ──────────────────────────────────── */}
                <section aria-label="Template language">
                    <SectionHeader
                        iconBg="bg-white/50"
                        icon={<GlobeIcon />}
                        title="Template Language"
                        subtitle="Choose the language used in your CV template."
                    />

                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl ring-1 ring-black/[0.06] shadow-sm overflow-hidden">
                        {/* Selected language summary / toggle */}
                        <button
                            type="button"
                            onClick={() => setShowLanguageSelector((v) => !v)}
                            className="w-full flex items-center justify-between gap-4 px-5 py-4 hover:bg-black/[0.02] active:scale-[0.998] transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#007dff]"
                        >
                            <div className="flex items-center gap-3">
                                <img
                                    src={languageFlag}
                                    alt={languageLabel}
                                    className="w-[30px] h-[22px] rounded-[3px] object-cover shadow-[0_1px_4px_rgba(0,0,0,0.18)] flex-shrink-0"
                                />
                                <span className="text-[14px] font-semibold text-gray-800">{languageLabel}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[12px] font-medium text-gray-400">
                                <span>{showLanguageSelector ? 'Close' : 'Change'}</span>
                                <ChevronDown
                                    className="h-4 w-4 flex-shrink-0 transition-transform duration-300"
                                    style={{ transform: showLanguageSelector ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                />
                            </div>
                        </button>

                        {/* Expandable language list */}
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateRows: showLanguageSelector ? '1fr' : '0fr',
                                transition: 'grid-template-rows 320ms cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                        >
                            <div ref={langListRef} className="overflow-hidden">
                                <div className="border-t border-gray-100">
                                    <div className="flex flex-col divide-y divide-gray-100 max-h-64 overflow-y-auto">
                                        {LANGUAGES.map(([code, { svg, label }]) => {
                                            const isSelected = language === code;
                                            return (
                                                <button
                                                    key={code}
                                                    type="button"
                                                    onClick={() => { setLanguage(code); setShowLanguageSelector(false); }}
                                                    className={[
                                                        'w-full flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors duration-100',
                                                        isSelected ? 'bg-[#f0f6ff]' : 'hover:bg-black/[0.025]',
                                                    ].join(' ')}
                                                >
                                                    <img
                                                        src={svg}
                                                        alt={label}
                                                        className="w-7 h-[20px] rounded-[3px] object-cover flex-shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.15)]"
                                                    />
                                                    <span className={[
                                                        'flex-1 text-left text-[14px]',
                                                        isSelected ? 'font-semibold text-[#007dff]' : 'font-medium text-gray-800',
                                                    ].join(' ')}>
                                                        {label} {detectedLanguage && detectedLanguage == code ? (
                                                            <span className="text-[11px] font-normal text-gray-400 ml-1.5">
                                                                (Detected)
                                                            </span>
                                                        ) : null}
                                                    </span>
                                                    {isSelected && <Check className="h-4 w-4 text-[#007dff] flex-shrink-0" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Color Theme ────────────────────────────────────────── */}
                <section aria-label="Color theme">
                    <SectionHeader
                        iconBg="bg-white/50"
                        icon={<PaletteIcon />}
                        title="Color Theme"
                        subtitle="Personalize the accent color of your template."
                    />

                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl ring-1 ring-black/[0.06] shadow-sm overflow-hidden">
                        {/* Swatch row */}
                        <div className="px-5 py-4">
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3.5">
                                Preset Colors
                            </p>
                            <div className="flex flex-wrap gap-3 items-center">
                                {colors.map((color) => (
                                    <ColorSwatch
                                        key={color}
                                        color={color}
                                        isSelected={templateColor === color}
                                        onSelect={() => selectColor(color)}
                                        onDelete={!CV_COLOR_THEMES.includes(color) ? deleteCustomColor : undefined}
                                    />
                                ))}
                                <button
                                    onClick={() => setShowCustomPicker((v) => !v)}
                                    aria-label="Add custom color"
                                    title="Add custom color"
                                    className={[
                                        'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200',
                                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#007dff]',
                                        'cursor-pointer border-2 border-dashed hover:scale-110',
                                        showCustomPicker
                                            ? 'border-[#007dff] bg-blue-50 text-[#007dff]'
                                            : 'border-gray-300 text-gray-400 hover:border-gray-400',
                                    ].join(' ')}
                                >
                                    <Plus size={14} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>

                        {/* Custom picker */}
                        {showCustomPicker && (
                            <div className="px-5 py-4 border-t border-gray-100 flex items-center gap-3">
                                <input
                                    type="color"
                                    value={customColorInput}
                                    onChange={(e) => setCustomColorInput(e.target.value)}
                                    className="w-10 h-10 rounded-xl cursor-pointer border border-gray-200 p-0.5"
                                    aria-label="Custom color picker"
                                />
                                <span className="text-sm font-mono text-gray-500 tabular-nums">
                                    {customColorInput.toUpperCase()}
                                </span>
                                <button
                                    onClick={() => addCustomColor(customColorInput)}
                                    className="ml-auto px-4 py-1.5 rounded-full text-xs font-semibold bg-[#007dff] text-white hover:bg-[#0066d6] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#007dff] focus-visible:ring-offset-1"
                                >
                                    Add Color
                                </button>
                            </div>
                        )}

                        {/* Selected swatch indicator */}
                        {templateColor && (
                            <div className="px-5 py-3.5 border-t border-gray-100 flex items-center gap-2.5">
                                <div
                                    className="w-4 h-4 rounded-full shadow-sm ring-1 ring-black/10 flex-shrink-0"
                                    style={{ backgroundColor: templateColor }}
                                />
                                <span className="text-[13px] text-gray-400">
                                    Selected:{' '}
                                    <span className="font-mono font-medium text-gray-700">
                                        {templateColor.toUpperCase()}
                                    </span>
                                </span>
                            </div>
                        )}
                    </div>
                </section>

            </div>
        </div>
    );
};

export default TemplateEditor;

