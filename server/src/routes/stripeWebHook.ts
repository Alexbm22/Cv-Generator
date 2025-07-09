import { Request, Response, NextFunction } from "express";
import { stripe } from '../app';
import { AppError, catchAsync } from "../middleware/error_middleware";
import { ErrorTypes } from "../interfaces/error_interface";

export default () => catchAsync((req: Request, res: Response, next: NextFunction) => {
    const sig = req.headers['stripe-signature'] as string;

    try {
        const event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET!
        );

        // to do: handle the payment event
        switch(event.type) {
            case 'payment_intent.succeeded':
                break
        }
    } catch (error) {
        next(new AppError(
            `Webhook signature verification failed.`,
            400,
            ErrorTypes.BAD_REQUEST
        ))
    }

})