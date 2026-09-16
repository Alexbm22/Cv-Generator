import * as Pages from '../pages/index'
import { requireAuth, requireGuest, requireLocalAuth, RouteGuardFn } from './guards';

export const routes = {
    home: { path: '/', element: Pages.HomePage, guards: [] },
    login: { path: '/login', element: Pages.Login, guards: [requireGuest] },
    signup: { path: '/signup', element: Pages.SignUp, guards: [requireGuest] },
    resumes: { path: '/resumes', element: Pages.CVsPage, guards: [] },
    editResume: { path: '/resumes/edit/:id', element: Pages.CVEditPage, guards: [] },
    plans: { path: '/plans', element: Pages.Plans, guards: [requireAuth] },
    checkout: { path: '/checkout/:price_lookup_key', element: Pages.Checkout, guards: [requireAuth] },
    settings: { path: '/settings', element: Pages.SettingsPage, guards: [requireAuth] },
    changePassword: { path: '/change-password', element: Pages.ChangePassword, guards: [requireAuth, requireLocalAuth] },
    notFound: { path: '*', element: Pages.NotFoundPage, guards: [] },
};

export interface route {
    path: string;
    element: React.FC<{}>;
    guards: RouteGuardFn[];
}