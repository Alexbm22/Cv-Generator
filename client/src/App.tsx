import { BrowserRouter as Router, Routes, Route  } from 'react-router-dom'
import { routes } from './config/routes'
import { useCheckAuth } from './hooks/useAuth';
import { useHydrateCVs, useFetchCVs } from './hooks/useCVs';
import { useAuthStore, useCVsStore } from './Store';
import { useEffect } from 'react';
import './index.css';

function App() {

  const { mutate: checkAuth, isPending: isPendingAuth } = useCheckAuth();

  const { mutate: hydrateCVs } = useHydrateCVs();
  const { mutate: fetchCVs } = useFetchCVs();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setIsLoadingAuth = useAuthStore((state) => state.setIsLoadingAuth);
  
  const lastSynced = useCVsStore((state) => state.lastSynced);
  
  useEffect(()=>{

    checkAuth();
    setIsLoadingAuth(isPendingAuth);
  },[checkAuth])
  
  
  useEffect(() => {
    if(isAuthenticated) {

      if (!lastSynced) {
        fetchCVs();
      } else {
        hydrateCVs();
      }
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
