import { useAuthStore } from '../Store';
import { route } from './routes';
import { Navigate, useLocation } from 'react-router-dom';

export interface componentProps {
    children: React.ReactNode;
    route: route;
}

const RouteGuard:React.FC<componentProps> = ({children, route}: componentProps ) => {
    
    // to do: add loading UI
    const isLoadingAuth = useAuthStore(state => state.isLoadingAuth);

    const location = useLocation();

    if(isLoadingAuth) {
        return <>Loading...</>
    }

    for (const guard of route.guards) {
        const result = guard();
        if (result !== true) {
            return <Navigate to={result.redirectTo} state={{ from: location }} replace />;
        }
    }

    return <>{children}</>;
}

export default RouteGuard;