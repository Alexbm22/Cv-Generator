import { BrowserRouter as Router, Routes, Route  } from 'react-router-dom'
import Layout from '../components/features/layout'
import { routes } from './routes' 
import RouteGuard from './RouteGuard'

const AppRoutes: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path='/' element={<Layout/>}>
                    {
                        Object.entries(routes).map(([key, route]) => (
                            <Route key={key} path={route.path} element={
                                <RouteGuard route={route}>
                                    <route.element />
                                </RouteGuard>
                            } />
                        ))
                    }
                </Route>
            </Routes>
      </Router>
    )
}

export default AppRoutes;