import { Request, Response, NextFunction } from 'express';
import { user } from '../models';

export class AuthController{
    static async login(req: Request, res: Response, next: NextFunction) {
        const { email, password} : { email: string, password: string } = req.body;


    }
}