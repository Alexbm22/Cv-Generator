import { Request, Response, NextFunction } from 'express';
import {
    AuthRequest,
    AuthResponse,
    loginDto,
    registerDto
} from '../interfaces/auth';
import { AuthServices } from '../services/auth';

export class AuthController {
    private authServices: AuthServices;

    constructor() {
        this.authServices = new AuthServices();
    }
    
    async login(req: Request, res: Response, next: NextFunction) {
        const loginDto: loginDto = req.body;

        try {
            const loginResult = await this.authServices.login(loginDto, res);
            return res.status(200).json(loginResult);
        } catch (error) {
            return next(error)
        }
    }

    async googleLogin(req: Request, res: Response, next: NextFunction) {
        const IdToken: string = req.body.credential;

        try {
            const loginResult = await this.authServices.googleLogin(IdToken, res, next);
            return res.status(200).json(loginResult);
        } catch (error) {
            return next(error)
        }
    }

    async register(req: Request, res: Response, next:NextFunction){
        const registerDto: registerDto = req.body;

        try {
            const registrationResult = await this.authServices.register(registerDto, res);
            return res.status(201).json(registrationResult);
        } catch (error) {
            return next(error)
        }
    }

    async logout(req: AuthRequest, res: Response, next: NextFunction) {
        const user = req.user;
        try {
            const logoutResult = await this.authServices.logout(user, res);
            return res.status(200).json(logoutResult);
        } catch (error) {
            return next(error)
        }
    }

    async refreshToken(req: AuthRequest, res: Response, next: NextFunction){
        try {
            const refreshResult = await this.authServices.refreshToken(req, res);   
            if (refreshResult) {
                return res.status(200).json(refreshResult);
            }
        } catch (error) {
            return next(error);
        }
    }

    async checkAuth(req: AuthRequest, res: Response, next: NextFunction){
        try {
            const refreshResult = await this.authServices.refreshToken(req, res);   
            if (refreshResult) {
                return res.status(200).json(refreshResult);
            }
        } catch (error) {
            return next(error);
        }
    }
}
