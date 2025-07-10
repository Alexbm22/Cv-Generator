import { Request, Response, NextFunction } from "express";
import { stripe } from '../app';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export default (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string;
    let event = req.body;
    
    if(endpointSecret){
        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                signature,
                endpointSecret
            );
        } catch (error) {
            console.log(`⚠️  Webhook signature verification failed.`, error);
            res.sendStatus(400);
        }
        
    }

    // to do: handle the payment event
    // switch(event.type) {
    //     case 'payment_intent.succeeded':
    //         break
    // }

    res.json({received: true});
}