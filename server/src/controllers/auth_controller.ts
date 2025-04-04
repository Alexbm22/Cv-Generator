import { Request, Response, NextFunction } from 'express';
import {
    AuthRequest,
    AuthResponse,
    loginDto,
    registerDto
} from '../interfaces/auth_interfaces';
import { AuthServices } from '../services/auth_service';
import { AppError } from '../middleware/error_middleware';

export class AuthController{
    private authServices: AuthServices;

    constructor() {
        this.authServices = new AuthServices();
    }

    async register(req: Request, res: Response, next:NextFunction){
        const registerDto: registerDto = req.body;

        const registrationResult: AuthResponse = await this.authServices.register(registerDto, res);

        if(!registrationResult.success) {
            return next(new AppError(registrationResult.message, 401));
        }

        return res.status(201).json({ registrationResult: registrationResult});
    }

    async login(req: Request, res: Response, next: NextFunction) {
        const loginDto: loginDto = req.body;

        const loginResult: AuthResponse = await this.authServices.login(loginDto, res);

        if (!loginResult.success){
            return next(new AppError(loginResult.message, 401));
        }

        return res.status(200).json({ loginResult: loginResult});
    }

    async logout(req: Request, res: Response, next: NextFunction) {
        const AuthRequest = req as AuthRequest;
        const user = AuthRequest.user;

        if (!user) {
            return next(new AppError('User not provided', 401));
        }

        const logoutResult: AuthResponse = await this.authServices.logout(user, res);

        if (!logoutResult.success) {
            return next(new AppError(logoutResult.message, 401));
        }

        return res.status(200).json({ logoutResult: logoutResult});
    }
}