import * as Pages from '../pages/index'
import { requireAuth, requireGuest, RouteGuardFn } from './guards';

export const routes = {
    home: { path: '/', element: Pages.HomePage, guards: [] },
    login: { path: '/login', element: Pages.Login, guards: [requireGuest] },
    signup: { path: '/signup', element: Pages.SignUp, guards: [requireGuest] },
    resumes: { path: '/resumes', element: Pages.CVsPage, guards: [] },
    editResume: { path: '/resumes/edit/:id', element: Pages.CVEditPage, guards: [] },
    plans: { path: '/plans', element: Pages.Plans, guards: [requireAuth] },
    checkout: { path: '/checkout/:price_lookup_key', element: Pages.Checkout, guards: [requireAuth] },
    settings: { path: '/settings', element: Pages.SettingsPage, guards: [requireAuth] },
    passwordForgot: { path: '/password/forgot', element: Pages.ForgotPassword, guards: [] },
    passwordAction: { path: '/password/action', element: Pages.PasswordActionLanding, guards: [] },
    passwordReset: { path: '/password/reset', element: Pages.PasswordReset, guards: [] },
    passwordChange: { path: '/password/change', element: Pages.PasswordChange, guards: [] },
    passwordSet: { path: '/password/set', element: Pages.PasswordSet, guards: [] },
    notFound: { path: '*', element: Pages.NotFoundPage, guards: [] },
};

export interface route {
    path: string;
    element: React.FC;
    guards: RouteGuardFn[];
}