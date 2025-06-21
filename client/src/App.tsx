import { BrowserRouter as Router, Routes, Route  } from 'react-router-dom'
import { routes } from './config/routes'
import { useCheckAuth } from './hooks/useAuth';
import { useAuthStore } from './Store';
import { useEffect } from 'react';

function App() {

  const { mutate, isPending } = useCheckAuth();
  const { setIsLoadingAuth } = useAuthStore.getState();

  useEffect(()=>{
    mutate();
    setIsLoadingAuth(isPending);
  },[])

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
