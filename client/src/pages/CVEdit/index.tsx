import React, { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCvEditStore, useCVsStore } from "../../Store";
import { CVAttributes } from "../../interfaces/cv";
import CVEditorForm  from "../../components/features/CVEditor/CVForm";
import CVPreview from "../../components/features/CVEditor/CVPreview";
import DownloadBtn from "../../components/features/pdf/download";
import { routes } from "../../router/routes";

const CVEditPage: React.FC = () => {
    
    const navigate = useNavigate();
    const { id } = useParams<{id: string}>();
    if(!id) navigate(routes.notFound.path, { replace: true });

    const CVs = useCVsStore((state) => state.CVs);
    const _hasHydrated = useCVsStore((state) => state._hasHydrated);
    const setCV = useCvEditStore((state) => state.setCV);

    const selectedCVRef = useRef<null | CVAttributes>(null);

    useEffect(() => {

        const CV = CVs.find((cv) => cv.id === id) as CVAttributes;
        selectedCVRef.current = CV;

        if(selectedCVRef.current){
            setCV(CV);
        }
    }, [_hasHydrated]);

    if(!selectedCVRef.current) {
        return <div> Loading CV.. </div>
    } 

    return (
        <div className="flex flex-column w-full h-full relative">
            <DownloadBtn downloadedCV={selectedCVRef.current}/>
            <CVEditorForm/>
            <CVPreview/>
        </div>
    );
}

export default CVEditPage;