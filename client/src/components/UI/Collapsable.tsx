import React, { useRef, useState, useEffect } from "react";
import { Trash2 } from 'lucide-react';

interface CollapsableProps {
  title: string;
  children: React.ReactNode;
  onDelete?: () => void;
}

const Collapsable:React.FC<CollapsableProps> = ({ title, children, onDelete }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Initialize the Collapsable component as closed by default
    const [height, setHeight] = useState('0px'); 
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(()=>{
        if (containerRef.current) {
            setHeight(isOpen? `${containerRef.current.scrollHeight}px` : '0px');
        }

        const handleResize = () => {
            if (containerRef.current) {
                setHeight(isOpen? `fit-content` : '0px');
            }
        }

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        }

    },[isOpen])

    return (
        <div className="border rounded-lg p-5 pt-0 border-gray-300 font-sans shadow-sm" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <div className="flex items-center pt-5 justify-between col-span-2 cursor-pointer"  onClick={() => setIsOpen(!isOpen)}>
                <span className="text-lg font-medium text-gray-700">{title}</span>
                <div className="flex gap-x-4">
                    {onDelete && <button onClick={onDelete} className={`cursor-pointer transition-opacity duration-400 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                        <Trash2 className="text-red-500 w-4 h-4 sm:w-5 sm:h-5" />
                    </button>}
                    <button><span 
                        className={`inline-block text-gray-500 hover:cursor-pointer transition-transform duration-200`}
                        style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    >▼</span></button>
                </div>
            </div>
            <div ref={containerRef} style={{height}} className={`overflow-hidden transition-all duration-500 ease-in-out`}>
                {children}
            </div>
        </div>
    )

}

export default Collapsable;