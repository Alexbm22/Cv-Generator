import { AuthRequest } from "../interfaces/auth";
import { UserServices } from "../services/user";
import { NextFunction, Response } from "express";

export class UserController {

    static async getUserProfile( req: AuthRequest, res: Response, next: NextFunction) {
        const userData = req.user;

        try {
            const userProfile = await UserServices.mapToProfile(userData);
            return res.status(200).json(userProfile);
            
        } catch (error) {
            return next(error);
        }
    }

} 