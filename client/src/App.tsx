import './index.css';
import AppRoutes from './router/AppRoutes';
import { useAuthEffects } from './hooks/Auth/useAuthEffects';

function App() {

  useAuthEffects();

  return (
    <AppRoutes/>
  )
}

export default App
