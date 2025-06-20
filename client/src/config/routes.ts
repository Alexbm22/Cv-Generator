import {
    HomePage,
    CVsPage,
    CVEditPage,
    NotFoundPage,
    Login,
    SignUp
} from '../pages/index'


export const routes = [
    { path: '/', element: HomePage, protected: false},
    { path: '/login', element: Login, protected: false},
    { path: '/signup', element: SignUp, protected: false},
    
    { path: '/resumes', element: CVsPage, protected: false},
    { path: '/resumes/edit/:id', element: CVEditPage, protected: false},

    { path: '*', element: NotFoundPage, protected: false} // 404 page

    // Add more routes here as needed
]