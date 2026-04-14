import React, { useRef, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff } from 'lucide-react';
import AddSectionButton from '../../../../UI/Buttons/AddSectionButton';

interface SortableSectionItemProps {
    id: string;
    title: string;
    description?: string;
    isVisible: boolean;
    onToggleVisibility: (id: string, isVisible: boolean) => void;
    onAdd?: () => void;
    addButtonLabel?: string;
    editableTitle?: boolean;
    titlePlaceholder?: string;
    onTitleChange?: (title: string) => void;
    children: React.ReactNode;
}

const SortableSectionItem: React.FC<SortableSectionItemProps> = ({
    id,
    title,
    description,
    isVisible,
    onToggleVisibility,
    onAdd,
    addButtonLabel,
    editableTitle,
    titlePlaceholder,
    onTitleChange,
    children,
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const containerRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(true);
    const [hover, setHover] = useState(false);
    const [height, setHeight] = useState<string>('auto');

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative',
    };

    const handleToggleCollapse = () => {
        if (isOpen) {
            if (containerRef.current) {
                setHeight(`${containerRef.current.scrollHeight}px`);
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        setHeight('0px');
                    });
                });
            }
        } else {
            if (containerRef.current) {
                setHeight(`${containerRef.current.scrollHeight}px`);
            }
        }
        setIsOpen(!isOpen);
    };

    const handleTransitionEnd = () => {
        if (isOpen) {
            setHeight('auto');
        }
    };

    const handleAdd = () => {
        if (!isOpen) {
            handleToggleCollapse();
        }
        onAdd?.();
    };

    return (
        <div ref={setNodeRef} style={style} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <div className="flex items-center gap-3">
                {/* Drag handle */}
                <button
                    {...attributes}
                    {...listeners}
                    className={`absolute cursor-grab -left-8 active:cursor-grabbing text-gray-400 hover:text-gray-600 flex-shrink-0 touch-none transition-opacity duration-500 ${hover ? 'opacity-100' : 'opacity-0'}`}
                    aria-label="Drag to reorder section"
                    type="button"
                >
                    <GripVertical size={18} />
                </button>

                {/* Title + Description (clickable to collapse) */}
                <div className="flex-1 cursor-pointer min-w-0" onClick={handleToggleCollapse}>
                    {editableTitle ? (
                        <input
                            type="text"
                            value={title}
                            placeholder={titlePlaceholder}
                            onChange={(e) => onTitleChange?.(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xl text-gray-600 font-bold bg-transparent border-none outline-none w-full placeholder-gray-400"
                        />
                    ) : (
                        <h2 className="text-xl text-gray-600 font-bold">{title}</h2>
                    )}
                    {description && <p className="text-sm text-gray-500">{description}</p>}
                </div>

                {/* Visibility toggle */}
                <button
                    type="button"
                    onClick={() => onToggleVisibility(id, !isVisible)}
                    className={`flex-shrink-0 text-gray-400 hover:text-gray-600 cursor-pointer transition-all duration-500 ${hover ? 'opacity-100' : 'opacity-0'}`}
                    aria-label={isVisible ? 'Hide section from CV' : 'Show section in CV'}
                >
                    {isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>

                {/* Collapse arrow */}
                <span
                    className={`inline-block transition-all duration-500 text-gray-500 flex-shrink-0 cursor-pointer select-none ${hover ? 'opacity-100' : 'opacity-0'}`}
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    onClick={handleToggleCollapse}
                >
                    ▼
                </span>
            </div>

            {/* Collapsable content */}
            <div
                ref={containerRef}
                style={{ height }}
                className="overflow-hidden transition-all duration-500 ease-in-out"
                onTransitionEnd={handleTransitionEnd}
            >
                {children}
            </div>

            {/* Add button - always visible */}
            {onAdd && addButtonLabel && (
                <div className="mt-4">
                    <AddSectionButton onClick={handleAdd} sectionName={addButtonLabel} />
                </div>
            )}
        </div>
    );
};

export default React.memo(SortableSectionItem);
