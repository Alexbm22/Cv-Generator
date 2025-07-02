import React, { useEffect } from "react";
import { useAuthAndSync } from "../../hooks/useAuth";
import { useAuthStore } from '../../Store'
import GoogleLoginBtn from "../../components/features/GoogleAuth/GoogleLoginBtn";

const Login: React.FC = () =>{

    const { setIsLoadingAuth, login } = useAuthStore.getState();
    const { mutate: mutateLogin, isPending } = useAuthAndSync(login);

    useEffect(() => {
        setIsLoadingAuth(isPending);
    }, [isPending]);

    return (
        <>
            <GoogleLoginBtn/>
            <button onClick={() => {
                mutateLogin({
                    email: 'alexandrub687@gmail.com',
                    password: 'C@,s22eva.2',
                })
            }}>Apasa</button>
        </>
    )
}

export default Login