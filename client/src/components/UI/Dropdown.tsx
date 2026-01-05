import React, { useState, useRef, useEffect, ReactNode } from "react";

type DropdownProps = {
    trigger: ReactNode;
    children: ReactNode;
    className?: string;
    position?: 'left' | 'right' | 'center';
    disabled?: boolean;
    width?: string; // tailwind width class or custom style
};

const Dropdown: React.FC<DropdownProps> = ({
    trigger,
    children,
    className = "",
    position = 'right',
    disabled = false,
    width
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const positionClasses = {
        left: 'left-0',
        right: 'right-0',
        center: 'left-1/2 transform -translate-x-1/2'
    };

    return (
        <div ref={dropdownRef} className="relative h-full">
            <div onClick={toggleDropdown} className="cursor-pointer h-full">
                {trigger}
            </div>

            {isOpen && (
                <div
                    className={`absolute ${positionClasses[position]} mt-2 ${width ? width : 'w-48'} bg-white border border-gray-200 rounded-md shadow-lg z-50 transition-all duration-200 ease-in-out opacity-100 transform translate-y-0 ${className}`}
                >
                    {children}
                </div>
            )}
        </div>
    );
};

export default Dropdown;