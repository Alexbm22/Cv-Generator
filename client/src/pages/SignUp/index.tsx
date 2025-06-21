import React, { useEffect } from "react";
import { useRegistration } from "../../hooks/useAuth";
import { useAuthStore } from '../../Store'

const SignUp: React.FC = () =>{

    const { mutate, isPending } = useRegistration();
    const { setIsLoadingAuth } = useAuthStore.getState();

    useEffect(() => {
        setIsLoadingAuth(isPending);
    }, [isPending]);

    return (
        <>
            <button onClick={() => {
                mutate({
                    username: 'john',
                    email: 'johnDe@gmail.com',
                    password: 'C@,s22eva.2',
                })
            }}>Click</button>
        </>
    )
}

export default SignUp