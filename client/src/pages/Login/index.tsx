import React, { useEffect } from "react";
import { useLogin } from "../../hooks/useAuth";
import { useAuthStore } from '../../Store'
import GoogleLoginBtn from "../../components/features/GoogleAuth/GoogleLoginBtn";

const Login: React.FC = () =>{

    const { mutate, isPending } = useLogin();
    const { setIsLoadingAuth } = useAuthStore.getState();

    useEffect(() => {
        setIsLoadingAuth(isPending);
    }, [isPending]);

    return (
        <>
            <GoogleLoginBtn/>
            <button onClick={() => {
                mutate({
                    email: 'alexandrub687@gmail.com',
                    password: 'C@,s22eva.2',
                })
            }}>Apasa</button>
        </>
    )
}

export default Login