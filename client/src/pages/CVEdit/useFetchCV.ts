import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCvEditStore, useCVsStore, useErrorStore } from "../../Store";
import { useQuery } from "@tanstack/react-query";
import { CVServerService } from "../../services/CVServer";
import { routes } from "../../router/routes";
import { AppError } from "../../services/Errors";
import { ErrorTypes } from "../../interfaces/error";

export const useFetchUserCV = (id?: string) => {
    const navigate = useNavigate();
    const setCV = useCvEditStore((state) => state.setUserCV);
    const setSelectedCV = useCVsStore(state => state.setUserSelectedCV)
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

export const useFetchGuestCV = (id?: string) => {
    const navigate = useNavigate();
    const setCV = useCvEditStore((state) => state.setGuestCV);
    const { cvs } = useCVsStore(state => state.CVState);
    const findGuestCV = useCVsStore(state => state.findGuestCV)     
    const setSelectedCV = useCVsStore(state => state.setGuestSelectedCV)
    const addError = useErrorStore(state => state.addError);

    useEffect(() => {
        if(!id) {
            navigate(routes.notFound.path, { replace: true });
            return;
        }

        const selectedCV = findGuestCV(id);
        if(selectedCV) {
            setCV(selectedCV);
            setSelectedCV(selectedCV);
        } else {
            addError(new AppError(
                "CV not found",
                404,
                ErrorTypes.NOT_FOUND
            ));

            navigate(routes.notFound.path, { replace: true });
            return;
        }

    }, [id, cvs])
}