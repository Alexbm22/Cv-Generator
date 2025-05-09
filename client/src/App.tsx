import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { routes } from './config/routes'

function App() {

  return (
    <>
      <Router>
        <Routes>
          {
            routes.map((route) => (
              <Route path={route.path} element={<route.element />} />
            ))
          }
        </Routes>
      </Router>
    </>
  )
}

export default App
