import React, { Suspense } from "react";
import { CVTemplates } from "../../../interfaces/cv";
import { useCvEditStore } from "../../../Store";
import PdfPreview from "../pdf/PdfPreview";

export const TemplateMap = {
    [CVTemplates.CASTOR]: React.lazy(() => import("./templates/castor")),
}

const CVPreview:React.FC = () => {

    const template = useCvEditStore((state) => state.template);
    const Template = TemplateMap[template];

    return (
        <div className="hidden bg-gray-100 overflow-hidden w-screen max-w-[calc(100vw*0.45)] h-screen justify-center items-center md:flex sticky top-0">
            <Suspense fallback={<div>Loading template...</div>}>
                <PdfPreview PdfDocument={Template} className='aspect-[1/1.4142] max-w-[90%] max-h-[90%]'/>
            </Suspense>
        </div>
    )
}

export default CVPreview;