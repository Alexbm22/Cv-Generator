import './index.css';
import AppRoutes from './router/AppRoutes';
import { useAuthEffects } from './hooks/Auth/useAuthEffects';
import { Suspense } from 'react';

function App() {
  useAuthEffects();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AppRoutes/>
    </Suspense>
  )
}

export default App
  