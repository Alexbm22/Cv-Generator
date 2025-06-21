import {
    HomePage,
    CVsPage,
    CVEditPage,
    NotFoundPage,
    Login,
    SignUp
} from '../pages/index'


export const routes = {
    home: {
        path: '/', 
        element: HomePage, 
        protected: false 
    },
    login: { 
        path: '/login', 
        element: Login, 
        protected: false 
    },
    signup: { 
        path: '/signup', 
        element: SignUp, 
        protected: false 
    },
    resumes: { 
        path: '/resumes', 
        element: CVsPage, 
        protected: false 
    },
    editResume: { 
        path: '/resumes/edit/:id', 
        element: CVEditPage, 
        protected: false 
    },
    notFound: { 
        path: '*', 
        element: NotFoundPage, 
        protected: false 
    },
};