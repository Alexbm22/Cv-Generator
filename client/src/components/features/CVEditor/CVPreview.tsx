import React, { Suspense } from "react";
import { CVTemplates } from "../../../interfaces/cv_interface";
import { useCvEditStore } from "../../../Store";

const TemplateMap = {
    [CVTemplates.CASTOR]: React.lazy(() => import("./templates/castor")),
}

const CVPreview:React.FC = () => {

    const template = useCvEditStore((state) => state.template);
    const Template = TemplateMap[template];

    return (
        <div className="hidden bg-gray-100 p-5 pt-10 w-full max-w-[calc(100vw*0.45)] h-auto max-h-screen justify-center md:flex sticky top-0 ">
           <Suspense fallback={<div>Loading template...</div>}>
                <Template 
                    templateClassName="flex flex-row bg-white w-[calc(100vw*0.4)] h-[calc(100vw*0.6)] max-w-[620px] max-h-[877px] shadow-lg"
                />
           </Suspense>
        </div>
    )
}

export default CVPreview;