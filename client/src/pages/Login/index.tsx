import React, { useState } from "react";
import { useAuthAndSync, useFormSubmission } from "../../hooks/useAuth";
import { useAuthStore } from '../../Store'
import GoogleLoginBtn from "../../components/features/GoogleAuth/GoogleLoginBtn";
import Field from '../../components/features/AuthForm/formField'
import { loginSchema } from "../../utils/validations";
import { loginDto } from "../../interfaces/auth";

const Login: React.FC = () =>{

    const { login } = useAuthStore.getState();
    const { mutate: mutateLogin } = useAuthAndSync(login);

    const [ showPassword, setShowPassword ] = useState(false);
    const toggleShowPassword = () => {
        setShowPassword((showPassword) => !showPassword)
    }

    const [ formData, setFormData ] = useState<loginDto>({
        email: '',
        password: ''
    })

    const handleSubmit = useFormSubmission(
        loginSchema,
        mutateLogin,
        (data: loginDto)=> ({
            ...data,
            email: data.email.trim().toLowerCase()
        })
    )

    return (
        <>
            <form name='login' onSubmit={(e) => {
                handleSubmit(formData)(e)
            }}>

                <Field 
                    name="email" 
                    type="email"
                    formOrigin="login"
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
                    formOrigin="login"
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

            <GoogleLoginBtn/>
        </>
    )
}

export default Login