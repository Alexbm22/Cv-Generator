import { useEffect, useState } from "react";
import { useCvEditStore, useCVsStore, useErrorStore } from "../../Store";
import { useQuery } from "@tanstack/react-query";
import { CVServerService } from "../../services/CVServer";
import { routes } from "../../router/routes";
import { CVStateMode, GuestCVAttributes } from "../../interfaces/cv";
import { useNavigate } from "react-router-dom";
import { ErrorTypes } from "../../interfaces/error";

export const useFetchUserCV = (id?: string) => {
    const CVStoreMode = useCVsStore(state => state.CVState.mode);
    const setCV = useCvEditStore((state) => state.setUserCV);
    const setSelectedCV = useCVsStore(state => state.setUserSelectedCV)
    const createError = useErrorStore(state => state.createError);

    const isUser = CVStoreMode === CVStateMode.USER;
    const isEnabled = isUser && !!id;
 
    const {
        data: CV,
        isSuccess,
        isError,
        error,
        isLoading
    } = useQuery({
        queryKey: [`CV:${id}`],
        queryFn: () => CVServerService.getCV(id!),
        enabled: isEnabled,
    });

    // Redirect if no id or no CV found
    useEffect(() => {
        if (isError) {
            createError(error);
            return;
        }
    }, [isError, error]);

    useEffect(() => {
        if(isSuccess) {
            setCV(CV);
            setSelectedCV(CV);
        }
    }, [CV, isSuccess, setCV]);

    return { isLoading, CV }
}

export const useFetchGuestCV = (id?: string) => {
    const setCV = useCvEditStore((state) => state.setGuestCV);
    const findGuestCV = useCVsStore(state => state.findGuestCV)     
    const setSelectedCV = useCVsStore(state => state.setGuestSelectedCV)
    const CVStoreMode = useCVsStore(state => state.CVState.mode);
    const _hasHydrated = useCVsStore(state => state.CVState._hasHydrated)

    const [ isLoading, setIsLoading ] = useState(true);
    const [ CVToEdit, setCVToEdit ] = useState<GuestCVAttributes | null>(null);

    // TODO: handle the case when the store has not been hydrated yet
    useEffect(() => {
        if(!id) {
            setIsLoading(false);
            return;
        }
        if(CVStoreMode !== CVStateMode.GUEST) {
            setIsLoading(false);
            return;
        }
        if(!_hasHydrated) {
            setIsLoading(true);
            return;
        }

        const selectedCV = findGuestCV(id);
        if(selectedCV) {
            setCV(selectedCV); 
            setSelectedCV(selectedCV);
            setCVToEdit(selectedCV);
        } 

        setIsLoading(false);

    }, [id, _hasHydrated])

    return { isLoading, CV: CVToEdit };
}

type ComponentProps = {
    id?: string
}

const useFetchCV: React.FC<ComponentProps> = ({ id }) => {
    const navigate = useNavigate();
    const CVStoreMode = useCVsStore(state => state.CVState.mode);
    const addError = useErrorStore(state => state.addError)

    const UserFetch = useFetchUserCV(id);
    const GuestFetch = useFetchGuestCV(id);

    const [ isLoading, setIsLoading ] = useState(true);

    useEffect(() => {
        if(!id) {
            navigate(routes.notFound.path, { replace: true });
            addError({
                name: "BadRequestError",
                message: "No Id passed!",
                statusCode: 400, 
                errType: ErrorTypes.BAD_REQUEST
            })
            return;
        }

        if(CVStoreMode === CVStateMode.USER) {
            if(!UserFetch.CV && !UserFetch.isLoading) {
                navigate(routes.notFound.path, { replace: true });
                addError({
                    name: "NotFoundError",
                    message: "No User CV Found",
                    statusCode: 404, 
                    errType: ErrorTypes.NOT_FOUND
                })
                return;
            }
        } else {
            if(!GuestFetch.CV && !GuestFetch.isLoading) {
                navigate(routes.notFound.path, { replace: true });
                addError({
                    name: "NotFoundError",
                    message: "No Guest CV Found",
                    statusCode: 404, 
                    errType: ErrorTypes.NOT_FOUND
                })
                return;
            }
        }

        setIsLoading(false);

    }, [id, UserFetch.isLoading, GuestFetch.isLoading])

    if(UserFetch.isLoading || GuestFetch.isLoading || isLoading) {
        return (
            <div>Loading...</div>
        )
    }
}

export default useFetchCV;