import React from 'react'
import { useAuthStore } from '../../Store'
import { useLogout } from '../../hooks/Auth/useAuth'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/UI/Buttons/Button'
import { ButtonStyles } from '../../constants/CV/buttonStyles'
import { routes } from '../../router/routes'

const HomePage: React.FC = () => {

  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  const { mutate: logout } = useLogout();
  const navigate = useNavigate();

  return (
    <>
      HOME
      {
        isAuthenticated && (<button onClick={() => {
          logout()
        }}>logout</button>)
      }
      <Button buttonStyle={ButtonStyles.primary} onClick={() => {
        navigate(routes.resumes.path)
      }}>resumes</Button>
    </>
  )
}

export default HomePage