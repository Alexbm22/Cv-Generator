import React, { useEffect } from "react";
import { useAuthAndSync } from "../../hooks/useAuth";
import { useAuthStore } from '../../Store'

const SignUp: React.FC = () =>{

    const { setIsLoadingAuth, register } = useAuthStore.getState();
    const { mutate: mutateRegister, isPending } = useAuthAndSync(register);

    useEffect(() => {
        setIsLoadingAuth(isPending);
    }, [isPending]);

    return (
        <>
            <button onClick={() => {
                mutateRegister({
                    username: 'john',
                    email: 'johnDe@gmail.com',
                    password: 'C@,s22eva.2',
                })
            }}>Click</button>
        </>
    )
}

export default SignUp