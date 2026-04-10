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
    
    static async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
        const authenticatedUser = req.user;
        const { currentPassword, newPassword } = req.body;

        try {
            await UserService.changePassword(authenticatedUser, currentPassword, newPassword);
            return res.status(200).json({ message: "Password changed successfully" });
        } catch (error) {
            return next(error);
        }
    }

    static async updateProfilePicturePreference(req: AuthRequest, res: Response, next: NextFunction) {
        const authenticatedUser = req.user;
        const { useAsDefault } = req.body;

        try {
            const result = await UserService.updateProfilePicturePreference(authenticatedUser, useAsDefault);
            return res.status(200).json(result);
        } catch (error) {
            return next(error);
        }
    }
}