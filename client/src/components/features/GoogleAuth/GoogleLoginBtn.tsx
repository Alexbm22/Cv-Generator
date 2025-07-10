import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
import { useAuthAndSync } from '../../../hooks/useAuth'
import { useAuthStore } from '../../../Store';

const GoogleLoginBtn: React.FC = () => {

    const { googleLogin } = useAuthStore.getState();
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