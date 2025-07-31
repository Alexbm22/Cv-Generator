import React, { useEffect, useState } from "react";
import { CVAttributes } from "../../../interfaces/cv";
import { useCvEditStore } from "../../../Store";
import PdfPreview from "../pdf/PdfPreview";
import { Buffer } from 'buffer';

(window as any).global = window;
(window as any).Buffer = Buffer;

const CVPreview:React.FC = () => {
    const CV = useCvEditStore.getState();
    const getCVObject = CV.getCVObject;
    const id = CV.id;

    const [ selectedCV, setSelectedCV ] = useState<CVAttributes | null>(null)

    useEffect(() => {
        if(id) {
            setSelectedCV(getCVObject());
        }
    }, [CV])
    
    if(!id || !selectedCV) return <div>Loading..</div>

    return (
        <div className="hidden bg-gray-100 overflow-hidden w-screen max-w-[calc(100vw*0.45)] h-screen justify-center items-center md:flex sticky top-0">
            <PdfPreview 
                CVData={selectedCV} 
                className='aspect-[1/1.4142] max-w-[90%] max-h-[90%]'/>
        </div>
    )
}

export default CVPreview;