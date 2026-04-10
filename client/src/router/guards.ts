import { useAuthStore } from '../Store';

export type GuardResult = true | { redirectTo: string };
export type RouteGuardFn = () => GuardResult;

export const requireAuth: RouteGuardFn = () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) return { redirectTo: '/login' };
    return true;
};

export const requireGuest: RouteGuardFn = () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) return { redirectTo: '/resumes' };
    return true;
};

export const requireLocalAuth: RouteGuardFn = () => {
    const { isAuthenticated, authProvider } = useAuthStore.getState();
    if (!isAuthenticated) return { redirectTo: '/login' };
    if (authProvider !== 'local') return { redirectTo: '/settings' };
    return true;
}
