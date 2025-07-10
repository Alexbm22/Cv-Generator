import { useAuthStore } from '../Store';
import { route, routes } from './routes';
import { Navigate, useLocation } from 'react-router-dom';

export interface componentProps {
    children: React.ReactNode;
    route: route;
}

const RouteGuard:React.FC<componentProps> = ({children, route}: componentProps ) => {
    
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    // to do: add loading UI
    const isLoadingAuth = useAuthStore(state => state.isLoadingAuth);

    const location = useLocation();

    if(isLoadingAuth) {
        return <>Loading...</>
    } else if (!isAuthenticated && route.protected) {
        return <Navigate 
            to={routes.login.path} 
            state={{ from: location }} 
            replace 
        />;
    } else if(
        isAuthenticated && 
        (
            route.path === routes.login.path ||
            route.path === routes.signup.path
        )
    ) {
        return <Navigate 
            to={routes.resumes.path} 
            state={{ from: location }} 
            replace 
        />;
    }

    return <>{children}</>;
}

export default RouteGuard;