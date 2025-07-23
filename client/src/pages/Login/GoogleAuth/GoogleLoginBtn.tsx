import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
import { useAuthAndSync } from '../../../hooks/useAuth';
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
        <>
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => {
                    console.log("fasfsa")
                }}
            />
        </>
    )
} 

export default GoogleLoginBtn