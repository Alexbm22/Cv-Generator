import React, { useState } from "react";
import { useAuthAndSync, useFormSubmission } from "../../hooks/Auth/useAuth";
import GoogleLoginBtn from "./GoogleAuth/GoogleLoginBtn";
import Field from '../../components/features/AuthForm/formField'
import { loginSchema } from "../../utils/validations";
import { loginDto } from "../../interfaces/auth";
import { AuthService } from "../../services/auth";
import bg from '../../assets/Images/login-bg.png'
import Button from "../../components/UI/Buttons/Button";
import { ButtonStyles } from "../../constants/CV/buttonStyles";
import { Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () =>{

    const login = AuthService.login.bind(AuthService);
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
        <div style={{backgroundImage: `url(${bg})`}} className="min-h-screen flex items-center justify-center bg-cover bg-center px-4 py-8 md:justify-end relative overflow-hidden before:absolute before:inset-0 before:bg-black/40">
            <div className="absolute inset-0 bg-[#13025965]"></div>
            <h1 className="hidden mr-auto ml-100 transform -translate-x-1/2 text-white font-serif text-2xl md:text-4xl font-semibold text-center max-w-md z-10 md:flex"
            >
                Hey there! Good to see you again. Let's get you back in.
            </h1>
            <div className="flex flex-col items-center bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md gap-4 md:mr-40 lg:mr-50 relative z-20">
                <h1 className="font-serif text-4xl mb-3 text-[#00409f]">Login</h1>
                <form className="w-full flex flex-col gap-3" name='login' onSubmit={(e) => {
                    handleSubmit(formData)(e)
                }}>

                    <Field 
                        name="email" 
                        type="email"
                        formOrigin="login"
                        label="Email"
                        placeholder="yourEmail@gmail.com"
                        value={formData.email}
                        onChange={(e) => {
                            setFormData((formData) => ({
                                ...formData,
                                [e.target.name]: e.target.value
                            }))
                        }}
                    />

                    <div className="relative w-full h-fit">
                        <Field 
                            name="password" 
                            type={ showPassword ? 'text' : "password" } 
                            formOrigin="login"
                            label="Password"
                            className="gap-1"
                            placeholder="your password"
                            value={formData.password}
                            onChange={(e) => {
                                setFormData((prevFormData) => ({
                                    ...prevFormData,
                                    password: e.target.value
                                }))
                            }}
                        >
                            <button 
                                type="button" 
                                onClick={toggleShowPassword}
                                className="cursor-pointer text-gray-500 hover:text-[#237bff] focus:outline-none transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </Field>
                    </div>

                    <Button 
                        type="submit" 
                        onClick={() => {}}
                        buttonStyle={ButtonStyles.primary}
                        className="w-full h-12 py-2 mt-6 !max-w-none"
                    >
                        Login
                    </Button>
                </form>

                <div className="w-full flex items-center gap-3 my-2">
                    <hr className="flex-1 border-gray-300" />
                    <span className="text-gray-400 text-sm font-medium">or</span>
                    <hr className="flex-1 border-gray-300" />
                </div>

                <div className="flex w-fit justify-center">
                    <GoogleLoginBtn/>
                </div>

                <p className="text-gray-600 text-sm text-center">
                    Don't have an account? <a href="/signup" className="text-[#237bff] hover:underline font-semibold">Sign up</a>
                </p>
            </div>
        </div>
    )
}

export default Login