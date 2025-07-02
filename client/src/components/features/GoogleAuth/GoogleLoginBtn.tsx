import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
import { useAuthAndSync } from '../../../hooks/useAuth'
import { useAuthStore } from '../../../Store'
import { useEffect } from 'react'

const GoogleLoginBtn: React.FC = () => {

    const { setIsLoadingAuth, googleLogin } = useAuthStore.getState();
    const { mutate: mutateGoogleLogin, isPending } = useAuthAndSync(googleLogin);

    const handleSuccess = (googleResponse: CredentialResponse) => {
        if(!googleResponse.credential){
            // to display the error to the user
        }
        else {
            mutateGoogleLogin(googleResponse);
        }
    }

    useEffect(() => {
        if (isPending) {
            setIsLoadingAuth(true);
        } else {
            setIsLoadingAuth(false);
        }
    }, [isPending]);

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