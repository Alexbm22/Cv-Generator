import './App.css'
import { useCvStore } from './Store'

function App() {

  const { title, setTitle } = useCvStore();

  return (
    <>
      <div>
        Cv gen App
      </div>

      <div>
        <input type="text" onChange={(e) => {
          setTitle(e.target.value);
        }} />
        {title}
      </div>
    </>
  )
}

export default App
