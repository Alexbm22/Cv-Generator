import { Request, Response, NextFunction } from 'express';
import {
    AuthRequest,
    AuthResponse,
    loginDto,
    registerDto
} from '../interfaces/auth_interfaces';
import { AuthServices } from '../services/auth_service';
import { AppError } from '../middleware/error_middleware';
import { ErrorTypes } from '../interfaces/error_interface';

export class AuthController {
    private authServices: AuthServices;

    constructor() {
        this.authServices = new AuthServices();
    }
    
    async login(req: Request, res: Response, next: NextFunction) {
        const loginDto: loginDto = req.body;

        const loginResult = await this.authServices.login(loginDto, res, next);

        return res.status(200).json(loginResult);
    }

    async googleLogin(req: Request, res: Response, next: NextFunction) {
        const IdToken: string = req.body.credential;

        const loginResult = await this.authServices.googleLogin(IdToken, res, next);

        return res.status(200).json(loginResult);
    }

    async register(req: Request, res: Response, next:NextFunction){
        const registerDto: registerDto = req.body;

        const registrationResult = await this.authServices.register(registerDto, res, next);

        return res.status(201).json(registrationResult);
    }

    async logout(req: AuthRequest, res: Response, next: NextFunction) {
        const user = req.user;

        if (!user) {
            return next(new AppError('User not provided', 401, ErrorTypes.UNAUTHORIZED));
        }

        const logoutResult = await this.authServices.logout(user, res, next);

        return res.status(200).json(logoutResult);
    }

    async refreshToken(req: AuthRequest, res: Response, next: NextFunction){
        try {
            const refreshResult = await this.authServices.refreshToken(req, res, next);   
            if (refreshResult) {
                return res.status(200).json(refreshResult);
            }
        } catch (error) {
            next(error);
        }
    }

    async checkAuth(req: AuthRequest, res: Response, next: NextFunction){
        try {
            const refreshResult = await this.authServices.refreshToken(req, res, next);   
            if (refreshResult) {
                return res.status(200).json(refreshResult);
            }
        } catch (error) {
            next(error);
        }
    }
}
