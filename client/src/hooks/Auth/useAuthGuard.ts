import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../Store";
import { routes } from "../../router/routes";

export const useAuthGuard = () => {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const navigate = useNavigate();

    const requireAuth = () => {
        if (!isAuthenticated) {
            navigate(routes.login.path);
            return false;
        }
        return true;
    };

    return { requireAuth, isAuthenticated };
};

export default useAuthGuard;