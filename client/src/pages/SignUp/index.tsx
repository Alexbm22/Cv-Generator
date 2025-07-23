import React, { useEffect, useState } from "react";
import { useAuthAndSync, useFormSubmission } from "../../hooks/Auth/useAuth";
import { useAuthStore } from '../../Store'
import { registerDto } from "../../interfaces/auth";
import Field from '../../components/features/AuthForm/formField'
import { registrationSchema } from "../../utils/validations";
import { AuthService } from "../../services/auth";

const SignUp: React.FC = () =>{

    const register = AuthService.register.bind(AuthService); 

    const setIsLoadingAuth = useAuthStore(state => state.setIsLoadingAuth);
    const { mutate: mutateRegistration, isPending } = useAuthAndSync(register);
    
    useEffect(() => {
        setIsLoadingAuth(isPending);
    }, [isPending]);

    const [ formData, setFormData ] = useState<registerDto>({
        username: '',
        email: '',
        password: ''
    })
    
    const [ showPassword, setShowPassword ] = useState(false);
    const toggleShowPassword = () => {
        setShowPassword((showPassword) =>  !showPassword)
    }

    const handleSubmit = useFormSubmission(
        registrationSchema,
        mutateRegistration,
        (data: registerDto)=> ({
            ...data,
            email: data.email.trim().toLowerCase()
        })
    )

    return (
        <>
            <form name="register" onSubmit={(e) => {
                handleSubmit(formData)(e)
            }}>

                <Field 
                    name="username" 
                    type="input"
                    formOrigin="register"
                    label="Username"
                    placeholder="your username"
                    value={formData.username}
                    onChange={(e) => {
                        setFormData((formData) => ({
                            ...formData,
                            [e.target.name]: e.target.value
                        }))
                    }}
                />

                <Field 
                    name="email" 
                    type="email"
                    formOrigin="register"
                    label="email"
                    placeholder="yourEmail@gmail.com"
                    value={formData.email}
                    onChange={(e) => {
                        setFormData((formData) => ({
                            ...formData,
                            [e.target.name]: e.target.value
                        }))
                    }}
                />

                <Field 
                    name="password" 
                    type={ showPassword ? 'text' : "password" } 
                    formOrigin="register"
                    label="password"
                    placeholder="your password"
                    value={formData.password}
                    onChange={(e) => {
                        setFormData((formData) => ({
                            ...formData,
                            [e.target.name]: e.target.value
                        }))
                    }}
                />

                <button onClick={toggleShowPassword}>view</button>

                <button type="submit">Submit</button>
            </form>
        </>
    )
}

export default SignUp