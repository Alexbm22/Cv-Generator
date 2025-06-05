import React, { useEffect } from "react";
import { useRegistration } from "../../hooks/useAuth";
import { useUserStore } from '../../Store/useUserStore'

const SignUp: React.FC = () =>{

    const { mutate, isPending } = useRegistration();
    const { setIsLoadingAuth } = useUserStore();

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
                    username: 'alex',
                    email: 'alexandrub687@gmail.com',
                    password: 'C@,s22eva.2',
                })
            }}>Apasa</button>
        </>
    )
}

export default SignUp