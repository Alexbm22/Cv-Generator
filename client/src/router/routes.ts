import {
    HomePage,
    CVsPage,
    CVEditPage,
    NotFoundPage,
    Login,
    SignUp,
    Prices,
    Checkout,
} from '../pages/index'

export const routes = {
    home: { path: '/', element: HomePage, protected: false },
    login: { path: '/login', element: Login, protected: false },
    signup: { path: '/signup', element: SignUp, protected: false },
    resumes: { path: '/resumes', element: CVsPage, protected: false },
    editResume: { path: '/resumes/edit/:id', element: CVEditPage, protected: false },
    prices: { path: '/prices', element: Prices, protected: true },
    checkout: { path: '/checkout/:priceId', element: Checkout, protected: true },
    notFound: { path: '*', element: NotFoundPage, protected: false },
};

export interface route {
    path: string;
    element: React.FC<{}>;
    protected: boolean;
}