import * as yup from 'yup';
import { loginDto, registerDto } from '../interfaces/auth';

export const registrationSchema = yup.object<registerDto>({
    username: yup
        .string()
        .required("Username is required!")
        .min(4, "Username must be at least 4 characters long"),
    email: yup
        .string()
        .required("Email is required!")
        .email("Invalid email adress!")
        .min(4, "Email must be at least 4 characters long"),
    password:  yup
        .string()
        .required("Password is required!")
        .min(5, 'Password must be minimum 5 characters!')
        .matches(/[a-z]/, 'Password must contain at least one lowercase letter!')
        .matches(/[A-Z]/, 'Password must contain at least one uppercase letter!')
        .matches(/\d/, 'Password must contain at least one number!')
})

export const loginSchema = yup.object<loginDto>({
    email: yup
        .string()
        .required("Email is required!")
        .email("Invalid email adress!"),
    password:  yup
        .string()
        .required("Password is required!")
})