import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCvEditStore, useCVsStore, useErrorStore } from "../../Store";
import { useQuery } from "@tanstack/react-query";
import { CVServerService } from "../../services/CVServer";
import { routes } from "../../router/routes";

export const useFetchCV = (id?: string) => {
    const navigate = useNavigate();
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
    }, [CV, isSuccess, setCV]);

    return {
        CV,
        isLoading
    }
}