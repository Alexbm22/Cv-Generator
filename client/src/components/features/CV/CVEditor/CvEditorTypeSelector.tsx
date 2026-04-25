import { useRef, useLayoutEffect, useState } from 'react';
import { FileText, Layout, Sparkles } from 'lucide-react';
import type { EditorType } from '../../../../interfaces/cv';

interface Option {
    value: EditorType;
    label: string;
    icon: React.ReactNode;
}

const OPTIONS: Option[] = [
    { value: 'form',     label: 'Form',     icon: <FileText size={13} strokeWidth={2} /> },
    { value: 'template', label: 'Template', icon: <Layout size={13} strokeWidth={2} /> },
    { value: 'ai',       label: 'AI',       icon: <Sparkles size={13} strokeWidth={2} /> },
];

interface CvEditorTypeSelectorProps {
    value: EditorType;
    onChange: (type: EditorType) => void;
}

const CvEditorTypeSelector: React.FC<CvEditorTypeSelectorProps> = ({ value, onChange }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [pillStyle, setPillStyle] = useState<{ left: number; width: number }>({ left: 4, width: 0 });

    const activeIndex = OPTIONS.findIndex(o => o.value === value);

    useLayoutEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const buttons = container.querySelectorAll<HTMLButtonElement>('[data-option]');
        const activeBtn = buttons[activeIndex];
        if (!activeBtn) return;

        const containerRect = container.getBoundingClientRect();
        const btnRect = activeBtn.getBoundingClientRect();

        setPillStyle({
            left: btnRect.left - containerRect.left,
            width: btnRect.width,
        });
    }, [activeIndex]);

    return (
        <div
            ref={containerRef}
            role="tablist"
            aria-label="CV editor mode"
            className="flex items-center rounded-full p-1 gap-0.5 relative h-[70%]"
            style={{
                background: 'rgba(0, 0, 0, 0.05)',
                border: '1px solid rgba(255,255,255,0.4)',
                backdropFilter: 'blur(8px)',
            }}
        >
            {/* Sliding pill indicator */}
            <span
                aria-hidden="true"
                className="absolute top-1 bottom-1 rounded-full bg-white shadow-sm pointer-events-none"
                style={{
                    left: pillStyle.left,
                    width: pillStyle.width,
                    transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1), width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
            />

            {OPTIONS.map((option) => {
                const isActive = option.value === value;
                return (
                    <button
                        key={option.value}
                        data-option={option.value}
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => onChange(option.value)}
                        className={[
                            'relative z-10 flex items-center gap-1.5 px-3 py-1 rounded-full',
                            'text-[11px] font-medium tracking-wide select-none',
                            'transition-colors duration-200 outline-none',
                            'focus-visible:ring-2 focus-visible:ring-[#007dff] focus-visible:ring-offset-1',
                            'cursor-pointer',
                            isActive
                                ? 'text-[#007dff]'
                                : 'text-gray-500 hover:text-gray-700',
                        ].join(' ')}
                    >
                        {option.icon}
                        <span>{option.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default CvEditorTypeSelector;
