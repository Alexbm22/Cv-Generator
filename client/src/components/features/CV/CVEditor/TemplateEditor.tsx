import React, { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { useCvEditStore } from '../../../../Store';
import { CVTemplates } from '../../../../interfaces/cv';

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

const PREDEFINED_COLORS = [
    '#2563EB', // Blue
    '#DC2626', // Red
    '#16A34A', // Green
    '#9333EA', // Purple
    '#EA580C', // Orange
    '#0891B2', // Cyan
    '#BE185D', // Pink
    '#78716C', // Stone
    '#1C1917', // Dark
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

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
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ color, isSelected, onSelect }) => (
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
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const TemplateEditor: React.FC<{ isShowingPreview: boolean }> = ({ isShowingPreview }) => {
    const template = useCvEditStore((state) => state.template);
    const setTemplate = useCvEditStore((state) => state.setTemplate);
    const colorTheme = useCvEditStore((state) => state.colorTheme);
    const setTemplateColorTheme = useCvEditStore((state) => state.setTemplateColorTheme);

    const [customColorInput, setCustomColorInput] = useState('#000000');
    const [showCustomPicker, setShowCustomPicker] = useState(false);

    const handleApplyCustomColor = () => {
        setTemplateColorTheme(customColorInput);
        setShowCustomPicker(false);
    };

    return (
        <div
            className="transition-all duration-1000 bg-[#f3fbff] w-full shadow-lg z-0.5 overflow-y-auto"
            style={isShowingPreview ? { flexBasis: '56.25%' } : { flexBasis: '100%' }}
        >
            <div className="px-6 py-8 mr-auto flex flex-col gap-10">

                {/* ── Template Selection ─────────────────────────────────── */}
                <section aria-label="Template selection">
                    <div className="mb-5">
                        <h2 className="text-xl text-[#154D71] font-bold">Choose Template</h2>
                        <p className="text-sm text-gray-400 mt-1">Select the layout for your CV.</p>
                    </div>

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

                <div className="border-t border-gray-200/80" />

                {/* ── Color Theme ────────────────────────────────────────── */}
                <section aria-label="Color theme">
                    <div className="mb-5">
                        <h2 className="text-xl text-[#154D71] font-bold">Color Theme</h2>
                        <p className="text-sm text-gray-400 mt-1">
                            Personalize the accent color of your template.
                            <span className="ml-1 text-xs text-gray-300">(coming soon)</span>
                        </p>
                    </div>

                    <div className="bg-white/70 rounded-2xl p-5 shadow-sm ring-1 ring-gray-200/60">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                            Preset Colors
                        </p>

                        <div className="flex flex-wrap gap-3 items-center">
                            {PREDEFINED_COLORS.map((color) => (
                                <ColorSwatch
                                    key={color}
                                    color={color}
                                    isSelected={colorTheme === color}
                                    onSelect={setTemplateColorTheme}
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

                        {showCustomPicker && (
                            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
                                <input
                                    type="color"
                                    value={customColorInput}
                                    onChange={(e) => setCustomColorInput(e.target.value)}
                                    className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 p-0.5"
                                    aria-label="Custom color picker"
                                />
                                <span className="text-sm font-mono text-gray-500 tabular-nums">
                                    {customColorInput.toUpperCase()}
                                </span>
                                <button
                                    onClick={handleApplyCustomColor}
                                    className="ml-auto px-4 py-1.5 rounded-full text-xs font-semibold bg-[#007dff] text-white hover:bg-[#0066d6] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#007dff] focus-visible:ring-offset-1"
                                >
                                    Apply
                                </button>
                            </div>
                        )}

                        {colorTheme && (
                            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2.5">
                                <div
                                    className="w-4 h-4 rounded-full shadow-sm ring-1 ring-gray-300/50"
                                    style={{ backgroundColor: colorTheme }}
                                />
                                <span className="text-xs text-gray-500">
                                    Selected:{' '}
                                    <span className="font-mono font-medium text-gray-700">
                                        {colorTheme.toUpperCase()}
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

