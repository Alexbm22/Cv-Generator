import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCvStore, useUserStore } from "../../Store";
import { CVAttributes } from "../../interfaces/cv_interface";
import CVEditorForm  from "../../components/features/CVEditor/CVForm";
import CVPreview from "../../components/features/CVEditor/CVPreview";

const CVEditPage: React.FC = () => {
    
    const navigate = useNavigate();
    const { id } = useParams<{id: string}>();

    const { CVs } = useUserStore();
    const { setCV } = useCvStore();
    
    const CV = CVs.find((cv) => cv.id === id) as CVAttributes;
    
    useEffect(()=>{
        if(!id || !CV) {
            navigate("/404", { replace: true });
            return;
        }
        else {            
            setCV(CV);
        }
    }, [CV, navigate]);

    return (
        <div className="flex flex-column w-full h-full relative">
            <CVEditorForm/>
            <CVPreview/>
        </div>
    );
}

export default CVEditPage;