import { BrowserRouter as Router, Routes, Route  } from 'react-router-dom'
import { routes } from './config/routes'
import { useCheckAuth } from './hooks/useAuth';
import { useHydrateCVs } from './hooks/useCVs';
import { useAuthStore } from './Store';
import { useEffect } from 'react';
import './index.css';

function App() {

  const { mutate: checkAuth, isPending: isPendingAuth } = useCheckAuth();
  const { mutate: hydrateCVs} = useHydrateCVs();

  const setIsLoadingAuth = useAuthStore((state) => state.setIsLoadingAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(()=>{
    checkAuth();
    setIsLoadingAuth(isPendingAuth);
  },[])

  
  useEffect(() => {
    if(isAuthenticated) {
      hydrateCVs();
    }
  }, [isAuthenticated])

  return (
    <>
      <Router>
        <Routes>
          {
            Object.entries(routes).map(([key, config]) => (
              <Route key={key} path={config.path} element={<config.element />} />
            ))
          }
        </Routes>
      </Router>
    </>
  )
}

export default App
