import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCvEditStore, useCVsStore, useErrorStore } from "../../Store";
import CVEditorForm  from "../../components/features/CVEditor/CVForm";
import CVPreview from "../../components/features/CVEditor/CVPreview";
import DownloadBtn from "../../components/features/pdf/download";
import { routes } from "../../router/routes";
import { useQuery } from "@tanstack/react-query";
import { CVServerService } from "../../services/CVServer";

const CVEditPage = () => {
    
    const navigate = useNavigate();
    const { id } = useParams<{id: string}>();

    const setCV = useCvEditStore((state) => state.setCV);
    const setSelectedCV = useCVsStore(state => state.setSelectedCV)
    const createError = useErrorStore(state => state.createError);

    const {
        data: CV,
        isSuccess,
        isError,
        error,
        isLoading
    } = useQuery({
        queryKey: [`CV:${id}`],
        queryFn: () => CVServerService.getCV(id!),
        enabled: !!id,
    });

    // Redirect if no id or no CV found
    useEffect(() => {
        if (isError) {
            createError(error);
            navigate(routes.resumes.path, { replace: true });
            return;
        } else if (!id) {
            navigate(routes.notFound.path, { replace: true });
            return;
        }
    }, [id, navigate, isError, error]);

    useEffect(() => {
        if(isSuccess) {
            setCV(CV);
            setSelectedCV(CV);
        }
    }, [CV, isSuccess, setCV])

    if (isLoading) {
        return <div>Loading...</div>;
    } else if(!CV) {
        return <div>No selected cv!</div>
    }
    
    return (
        <div className="flex flex-column w-full h-full relative">
            <CVEditorForm/>
            <CVPreview />
        </div>
    );
}

export default CVEditPage;