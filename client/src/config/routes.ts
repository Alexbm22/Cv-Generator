import {
    HomePage,
    CVsPage,
    CVEditPage,
    NotFoundPage
} from '../pages/index'


export const routes = [
    { path: '/', element: HomePage},
    
    { path: '/resumes', element: CVsPage},
    { path: '/resumes/edit/:id', element: CVEditPage},

    { path: '*', element: NotFoundPage} // 404 page

    // Add more routes here as needed
]