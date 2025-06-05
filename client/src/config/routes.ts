import {
    HomePage,
    CVsPage,
    CVEditPage,
    NotFoundPage,
    Login,
    SignUp
} from '../pages/index'


export const routes = [
    { path: '/', element: HomePage},
    { path: '/login', element: Login},
    { path: '/signup', element: SignUp},
    
    { path: '/resumes', element: CVsPage},
    { path: '/resumes/edit/:id', element: CVEditPage},

    { path: '*', element: NotFoundPage} // 404 page

    // Add more routes here as needed
]