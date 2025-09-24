import React, { useRef, useState, useEffect } from "react";

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
        <div className="border rounded-lg p-5 pt-0 border-gray-300 font-sans shadow-sm" >
            <div className="flex items-center pt-5 justify-between col-span-2 cursor-pointer"  onClick={() => setIsOpen(!isOpen)}>
                <span className="text-lg font-medium text-gray-700">{title}</span>
                <div className="flex gap-x-4">
                    {onDelete && <button onClick={onDelete}><span className="text-red-500 hover:cursor-pointer">del</span></button>}
                    <button><span 
                        className={`inline-block text-gray-500 hover:cursor-pointer transition-transform duration-200`}
                        style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    >▼</span></button>
                </div>
            </div>
            <div ref={containerRef} style={{ height }} className={`h-fit overflow-hidden transition-all duration-500 ease-in-out`}>
                {children}
            </div>
        </div>
    )

}

export default Collapsable;