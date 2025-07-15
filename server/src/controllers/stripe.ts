import { AuthRequest } from "../interfaces/auth";
import { StripeService } from "../services/stripe"
import { NextFunction, Response } from "express"

export class StripeController {

    static async getPricingPlans(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const response = await StripeService.getStripeProducts();
            return res.status(200).json(response)
        } catch (error) {
            next(error)
        }
    }

    static async createPaymentIntent(req: AuthRequest, res: Response, next: NextFunction) {
        const { priceId, quantity } = req.body;
        const userId = req.user.id;

        try {
            const paymentIntentRes = await StripeService.createPaymentIntent(priceId, userId, quantity);
            return res.status(200).json(paymentIntentRes);
        } catch (error) {
            return next(error);
        }
    }
}