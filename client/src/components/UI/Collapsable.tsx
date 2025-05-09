import React, { useRef, useState, useEffect } from "react";

interface CollapsableProps {
  title: string;
  children: React.ReactNode;
  deleteFunction?: () => void;
}

const Collapsable:React.FC<CollapsableProps> = ({ title, children, deleteFunction }) => {
    const [isOpen, setIsOpen] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState('auto');

    useEffect(()=>{
        if (containerRef.current) {
            setHeight(isOpen? `${containerRef.current.scrollHeight}px` : '0px');
        }
    },[isOpen])

    return (
        <div className="border rounded-lg p-5 border-gray-400 font-sans">
            <div className="flex items-center justify-between col-span-2">
                <span className="text-lg font-medium text-gray-700">{title}</span>
                <div className="flex gap-x-4">
                    {deleteFunction && <button onClick={deleteFunction}><span className="text-red-500 hover:cursor-pointer">del</span></button>}
                    <button onClick={() => setIsOpen(!isOpen)}><span className={`text-gray-500 hover:cursor-pointer ${isOpen ? 'rotate-180' : ''}`}>▼</span></button>
                </div>
            </div>
            <div ref={containerRef} style={{ height }} className={`overflow-hidden transition-all duration-500 ease-in-out`}>
                <div>
                    {children}
                </div>
            </div>
        </div>
    )

}

export default Collapsable;