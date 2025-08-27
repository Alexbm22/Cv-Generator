import React from "react";
import PdfPreview from "../pdf/PdfPreview";
import { Buffer } from 'buffer';
import { useCVsStore } from "../../../Store";

(window as any).global = window;
(window as any).Buffer = Buffer;

const CVPreview: React.FC = () => {
    
    const selectedCV = useCVsStore(state => state.selectedCV);

    if(!selectedCV) return <div>There is no CV to preview</div>
    
    return (
        <div className="hidden bg-gray-100 overflow-hidden w-screen max-w-[calc(100vw*0.45)] h-screen justify-center items-center md:flex sticky top-0">
            <PdfPreview 
                CVData={selectedCV} 
                className='aspect-[1/1.4142] max-w-[90%] max-h-[90%]'/>
        </div>
    )
}

export default CVPreview;