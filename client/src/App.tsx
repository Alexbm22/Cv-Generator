import './index.css';
import AppRoutes from './router/AppRoutes';
import { useAuthEffects } from './hooks/Auth/useAuthEffects';
import { useCVsEffects } from './hooks/CVs/useCVsEffects';

function App() {

  useAuthEffects();
  useCVsEffects();

  return (
    <AppRoutes/>
  )
}

export default App
