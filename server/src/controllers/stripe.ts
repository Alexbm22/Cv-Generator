import { AuthRequest } from "../interfaces/auth_interfaces";
import { StripeService } from "../services/stripe"
import { NextFunction, Response } from "express"

export class StripeController {

    static async getProucts(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const products = await StripeService.getStripeProducts();
            return res.status(200).json(products)
        } catch (error) {
            next(error)
        }
    }

    static async createPaymentIntent(req: AuthRequest, res: Response, next: NextFunction) {
        const userId = req.user.id;
        const priceId = req.body;

        try {
            const paymentIntentRes = await StripeService.createPaymentIntent(priceId, userId);
            res.status(200).json(paymentIntentRes);
        } catch (error) {
            next(error);
        }
    }
}