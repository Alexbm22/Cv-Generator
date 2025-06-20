import React, { useEffect } from "react";
import { useRegistration } from "../../hooks/useAuth";
import { useAuthStore } from '../../Store'

const SignUp: React.FC = () =>{

    const { mutate, isPending } = useRegistration();
    const { setIsLoadingAuth } = useAuthStore.getState();

    useEffect(() => {
        if (isPending) {
            setIsLoadingAuth(true);
        } else {
            setIsLoadingAuth(false);
        }
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