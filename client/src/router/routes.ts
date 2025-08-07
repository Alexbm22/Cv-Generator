import * as Pages from '../pages/index'

export const routes = {
    home: { path: '/', element: Pages.HomePage, protected: false },
    login: { path: '/login', element: Pages.Login, protected: false },
    signup: { path: '/signup', element: Pages.SignUp, protected: false },
    resumes: { path: '/resumes', element: Pages.CVsPage, protected: false },
    editResume: { path: '/resumes/edit/:id', element: Pages.CVEditPage, protected: false },
    downloads: { path: '/downloads', element: Pages.Downloads, protected: true },
    prices: { path: '/prices', element: Pages.Prices, protected: true },
    checkout: { path: '/checkout/:priceId', element: Pages.Checkout, protected: true },
    notFound: { path: '*', element: Pages.NotFoundPage, protected: false },
};

export interface route {
    path: string;
    element: React.FC<{}>;
    protected: boolean;
}