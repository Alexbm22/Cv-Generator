import React, { Suspense } from "react";
import { CVTemplates } from "../../../interfaces/cv";
import { useCvEditStore } from "../../../Store";
import MyCV from "./templates/hermes";
import PdfPreview from "../pdf/PdfPreview";

const TemplateMap = {
    [CVTemplates.CASTOR]: React.lazy(() => import("./templates/castor")),
}

const CVPreview:React.FC = () => {

    const template = useCvEditStore((state) => state.template);
    const Template = TemplateMap[template];

    return (
        <div className="hidden bg-gray-100 p-5 pt-10 w-full max-w-[calc(100vw*0.45)] h-auto max-h-screen justify-center md:flex sticky top-0 ">
           <Suspense fallback={<div>Loading template...</div>}>
                <PdfPreview PdfDocument={MyCV}/>
           </Suspense>
        </div>
    )
}

export default CVPreview;