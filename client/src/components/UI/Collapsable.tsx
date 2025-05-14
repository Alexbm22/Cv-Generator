import React, { useRef, useState, useEffect } from "react";

interface CollapsableProps {
  title: string;
  children: React.ReactNode;
  onDelete?: () => void;
}

const Collapsable:React.FC<CollapsableProps> = ({ title, children, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState('auto');

    useEffect(()=>{
        if (containerRef.current) {
            setHeight(isOpen? `${containerRef.current.scrollHeight}px` : '0px');
        }

        const handleResize = () => {
            if (containerRef.current) {
                setHeight(isOpen? `${containerRef.current.scrollHeight}px` : '0px');
            }
        }

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        }

    },[isOpen])

    return (
        <div className="border rounded-lg p-5 border-gray-300 font-sans shadow-sm">
            <div className="flex items-center justify-between col-span-2 cursor-pointer"  onClick={() => setIsOpen(!isOpen)}>
                <span className="text-lg font-medium text-gray-700">{title}</span>
                <div className="flex gap-x-4">
                    {onDelete && <button onClick={onDelete}><span className="text-red-500 hover:cursor-pointer">del</span></button>}
                    <button><span className={`text-gray-500 hover:cursor-pointer ${isOpen ? 'rotate-180' : ''}`}>▼</span></button>
                </div>
            </div>
            <div ref={containerRef} style={{ height }} className={`h-fit overflow-hidden transition-all duration-500 ease-in-out`}>
                <div>
                    {children}
                </div>
            </div>
        </div>
    )

}

export default Collapsable;