import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
import { useAuthAndSync } from '../../../hooks/Auth/useAuth';
import { AuthService } from '../../../services/auth';

const GoogleLoginBtn: React.FC = () => {

    const googleLogin = AuthService.googleLogin.bind(AuthService);
    const { mutate: mutateGoogleLogin } = useAuthAndSync(googleLogin);

    const handleSuccess = (googleResponse: CredentialResponse) => {
        if(!googleResponse.credential){
            // to display the error to the user
        }
        else {
            mutateGoogleLogin(googleResponse);
        }
    }

    return (
        <GoogleLogin
            width='385'
            shape='square'
            onSuccess={handleSuccess}
            onError={() => {
                console.log("Google Login Failed");
            }}
        />
    )
} 

export default GoogleLoginBtn