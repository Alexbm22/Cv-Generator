import React, { useEffect, useState } from "react";
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

    const [selectedCV, setSelectedCV] = useState<CVAttributes | null>(null);

    useEffect(() => {
        const CV = CVs.find((cv) => cv.id === id) as CVAttributes | undefined;
        if (CV) {
            setSelectedCV(CV);
            setCV(CV);
        } else {
            setSelectedCV(null);
        }
    }, [_hasHydrated, id, CVs, setCV]);

    if(!selectedCV) {
        return <div> Loading CV.. </div>
    } 

    return (
        <div className="flex flex-column w-full h-full relative">
            <CVEditorForm/>
            <CVPreview/>
        </div>
    );
}

export default CVEditPage;