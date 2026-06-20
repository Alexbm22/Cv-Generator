import React, { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

interface CollapsableSectionProps {
  title: string;
  children: React.ReactNode;
  description?: string;
}

const CollapsableSection: React.FC<CollapsableSectionProps> = ({ title, description, children }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const [height, setHeight] = useState<string>('auto');
    const [isOpen, setIsOpen] = useState(true);
    const [isHovered, setIsHovered] = useState(false);

    const handleToggle = () => {
        if (isOpen) {
            // Snapshot current height before animating to 0
            if (containerRef.current) {
                setHeight(`${containerRef.current.scrollHeight}px`);
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        setHeight('0px');
                    });
                });
            }
        } else {
            // Animate to scrollHeight, then set to auto on transition end
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

    return (
        <div>
            <div className="flex items-center justify-between cursor-pointer select-none py-1" onClick={handleToggle} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                <div>
                    <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">{title}</h2>
                    {description && <p className="text-[13px] text-[#86868b] mt-0.5">{description}</p>}
                </div>
                <ChevronDown
                    className={`w-5 h-5 text-[#86868b] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
            </div>
            <div
                ref={containerRef}
                style={{ height }}
                className="overflow-hidden transition-all duration-500 ease-in-out"
                onTransitionEnd={handleTransitionEnd}
            >
                {children}
            </div>
        </div>
    );
};

export default CollapsableSection;
