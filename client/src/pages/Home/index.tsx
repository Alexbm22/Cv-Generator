import React from 'react'
import { useAuthStore } from '../../Store'
import { useLogout } from '../../hooks/Auth/useAuth'

const HomePage: React.FC = () => {

  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  const { mutate: logout } = useLogout();

  return (
    <>
      HOME
      {
        isAuthenticated && (<button onClick={() => {
          logout()
        }}>logout</button>)
      }
    </>
  )
}

export default HomePage