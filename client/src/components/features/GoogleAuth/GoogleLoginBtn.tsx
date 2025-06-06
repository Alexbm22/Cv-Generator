import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
import { useGoogleLogin } from '../../../hooks/useAuth'
import { useUserStore } from '../../../Store'
import { useEffect } from 'react'

const GoogleLoginBtn: React.FC = () => {

    const { mutate, isPending } = useGoogleLogin();
    const { setIsLoadingAuth } = useUserStore();

    const handleSuccess = (googleResponse: CredentialResponse) => {
        if(!googleResponse.credential){
            // to display the error to the user
        }
        else {
            mutate(googleResponse);
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