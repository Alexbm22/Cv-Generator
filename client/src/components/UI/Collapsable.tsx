import React, { useRef, useState, useEffect } from "react";
import { Trash2, ChevronDown } from 'lucide-react';

interface CollapsableProps {
  title: string;
  children: React.ReactNode;
  onDelete?: () => void;
}

const Collapsable:React.FC<CollapsableProps> = ({ title, children, onDelete }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const [height, setHeight] = useState('0px'); 
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleToggle = () => {
        if (isOpen) {
            // Snapshot the current rendered height (works even when height is 'auto'),
            // then on the next two frames animate down to 0 so CSS transition fires.
            if (containerRef.current) {
                const currentPx = containerRef.current.scrollHeight;
                setHeight(`${currentPx}px`);
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        setHeight('0px');
                    });
                });
            }
            setIsOpen(false);
        } else {
            if (containerRef.current) {
                setHeight(`${containerRef.current.scrollHeight}px`);
            }
            setIsOpen(true);
        }
    };

    // After the open-animation completes, switch to 'auto' so any child that
    // grows (e.g. the AI panel) can push the container height freely.
    const handleTransitionEnd = () => {
        if (isOpen) {
            setHeight('auto');
        }
    };

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current && isOpen) {
                setHeight('auto');
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isOpen]);

    return (
        <div
            className="bg-white rounded-2xl border border-black/[0.08] font-[system-ui,-apple-system,BlinkMacSystemFont,'SF_Pro_Text',sans-serif]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className="flex items-center px-5 py-4 justify-between cursor-pointer select-none"
                onClick={handleToggle}
            >
                <span className="text-[15px] font-semibold tracking-[-0.01em] text-gray-800">{title}</span>
                <div className="flex items-center gap-x-2">
                    {onDelete && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className={`flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 ${isHovered ? 'opacity-100 bg-red-50 hover:bg-red-100' : 'opacity-0'} cursor-pointer`}
                        >
                            <Trash2 className="text-red-400 w-3.5 h-3.5" />
                        </button>
                    )}
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100">
                        <ChevronDown
                            className="text-gray-400 w-4 h-4 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        />
                    </div>
                </div>
            </div>
            {isOpen && <div className="h-px bg-black/[0.06] mx-5" />}
            <div
                ref={containerRef}
                style={{ height }}
                className="overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                onTransitionEnd={handleTransitionEnd}
            >
                <div className="px-5 py-4">
                    {children}
                </div>
            </div>
        </div>
    )

}

export default Collapsable;