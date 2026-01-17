import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthAndSync, useFormSubmission } from "../../hooks/Auth/useAuth";
import { useAuthStore } from '../../Store'
import { registerDto } from "../../interfaces/auth";
import Field from '../../components/features/AuthForm/formField'
import { registrationSchema } from "../../utils/validations";
import { AuthService } from "../../services/auth";
import bg from '../../assets/Images/login-bg.png'
import Button from "../../components/UI/Button";
import { ButtonStyles } from "../../constants/CV/buttonStyles";
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { routes } from "../../router/routes";
import GoogleLoginBtn from "../Login/GoogleAuth/GoogleLoginBtn";

const SignUp: React.FC = () =>{
    const navigate = useNavigate();
    const register = AuthService.register.bind(AuthService); 

    const setIsLoadingAuth = useAuthStore(state => state.setIsLoadingAuth);
    const { mutate: mutateRegistration, isPending } = useAuthAndSync(register, {
        onSuccess: () => {
            navigate(routes.home.path);
        }
    });
    
    useEffect(() => {
        setIsLoadingAuth(isPending);
    }, [isPending, setIsLoadingAuth]);

    const [ formData, setFormData ] = useState<registerDto>({
        username: '',
        email: '',
        password: ''
    })
    
    const [ showPassword, setShowPassword ] = useState(false);
    const toggleShowPassword = () => {
        setShowPassword((prev) => !prev)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }))
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
        <div style={{backgroundImage: `url(${bg})`}} className="min-h-screen flex items-center justify-center bg-cover bg-center px-4 py-8 md:justify-end relative overflow-hidden before:absolute before:inset-0 before:bg-black/40">
            <div className="absolute inset-0 bg-[#13025965]"></div>
            <h1 className="hidden mr-auto ml-100 transform -translate-x-1/2 text-white font-serif text-2xl md:text-4xl font-semibold text-center max-w-md z-10 md:flex"
            >
                Join us today and get started with your CV.
            </h1>
            <div className="flex flex-col items-center bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md gap-4 md:mr-40 lg:mr-50 relative z-20">
                <h1 className="font-serif text-4xl mb-3 text-[#00409f]">Sign Up</h1>
                <form 
                    className="w-full flex flex-col gap-4" 
                    name="register" 
                    onSubmit={(e) => {
                        handleSubmit(formData)(e)
                    }}
                    aria-label="Sign up form"
                >
                    <Field 
                        name="username" 
                        type="text"
                        formOrigin="register"
                        label="Username"
                        placeholder="your username"
                        value={formData.username}
                        onChange={handleInputChange}
                    />

                    <Field 
                        name="email" 
                        type="email"
                        formOrigin="register"
                        label="Email"
                        placeholder="yourEmail@gmail.com"
                        value={formData.email}
                        onChange={handleInputChange}
                    />

                    <div className="relative w-full h-fit">
                        <Field 
                            name="password" 
                            type={showPassword ? 'text' : "password"} 
                            formOrigin="register"
                            label="Password"
                            className="gap-1"
                            placeholder="your password"
                            value={formData.password}
                            onChange={handleInputChange}
                        >
                            <button 
                                type="button" 
                                onClick={toggleShowPassword}
                                className="cursor-pointer text-gray-500 hover:text-[#237bff] focus:outline-none transition-colors"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </Field>
                        <p className="text-xs text-gray-500 mt-1 px-1">
                            Password must contain: uppercase, lowercase, number, and be at least 5 characters
                        </p>
                    </div>

                    <Button 
                        type="submit" 
                        onClick={() => {}}
                        buttonStyle={ButtonStyles.primary}
                        className="w-full h-12 py-2 mt-2 !max-w-none flex items-center justify-center gap-2"
                        disabled={isPending}
                        ariaLabel="Sign up"
                    >
                        {isPending ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                <span>Signing up...</span>
                            </>
                        ) : (
                            "Sign Up"
                        )}
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
                    Already have an account?{" "}
                    <Link 
                        to={routes.login.path} 
                        className="text-[#237bff] font-semibold hover:underline transition-all"
                    >
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default SignUp