import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCvEditStore, useCVsStore } from "../../Store";
import { CVAttributes } from "../../interfaces/cv_interface";
import CVEditorForm  from "../../components/features/CVEditor/CVForm";
import CVPreview from "../../components/features/CVEditor/CVPreview";
import { routes } from "../../router/routes";

const CVEditPage: React.FC = () => {
    
    const navigate = useNavigate();
    const { id } = useParams<{id: string}>();

    const CVs = useCVsStore((state) => state.CVs);
    const dbHydrated = useCVsStore((state) => state.dbHydrated);
    const setCV = useCvEditStore((state) => state.setCV);

    useEffect(() => {
        if(!id) navigate(routes.notFound.path, { replace: true });

        const CV = CVs.find((cv) => cv.id === id) as CVAttributes;

        if(CV){
            setCV(CV);
        }
    }, [dbHydrated]);

    return (
        <div className="flex flex-column w-full h-full relative">
            <CVEditorForm/>
            <CVPreview/>
        </div>
    );
}

export default CVEditPage;