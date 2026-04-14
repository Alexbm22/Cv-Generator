import React, { useRef, useState } from "react";

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
            <div className="flex items-center justify-between cursor-pointer" onClick={handleToggle} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                <div>
                    <h2 className="text-xl text-gray-600 font-bold">{title}</h2>
                    <p className="text-sm text-gray-500">{description}</p>
                </div>
                <span
                    className={`inline-block transition-all text-gray-500 duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >▼</span>
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
