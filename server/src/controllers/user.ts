import { InitialDataSyncAttributes } from "@/interfaces/user";
import { AuthRequest } from "../interfaces/auth";
import { UserService } from "../services/user";
import { NextFunction, Response } from "express";

export class UserController {

    static async getAccountData(req: AuthRequest, res: Response, next: NextFunction) {
        const userData = req.user;

        try {
            const accountData = await UserService.getAccountData(userData);
            return res.status(200).json(accountData);
        } catch (error) {
            return next(error);
        }
    }

    static async syncInitialData( req: AuthRequest, res: Response, next: NextFunction) {
        const authenticatedUser = req.user;
        const userInfo = authenticatedUser.get();
        const dataToSync: InitialDataSyncAttributes = req.body;

        try {
            const initialData = await UserService.syncInitialData(userInfo, dataToSync);
            return res.status(200).json(initialData);
        } catch (error) {
            return next(error);
        }
    } 
}