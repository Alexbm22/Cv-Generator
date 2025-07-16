import { AppError } from "../middleware/error_middleware";
import { Payments } from "../models";
import Stripe from "stripe";
import { ErrorTypes } from "../interfaces/error";
import { StripeService } from "./stripe";

export class PaymentService {

    static async createPayment(
        paymentIntent: Stripe.PaymentIntent,
        price: Stripe.Price
    ) {
        try {
            await Payments.create({
                payment_id: paymentIntent.id,
                user_id: Number(paymentIntent.metadata.userId),
                customer_id: 
                    typeof paymentIntent.customer === 'string' ? paymentIntent.customer : null,
                amount: paymentIntent.amount,
                quantity: paymentIntent.metadata.quantity ? Number(paymentIntent.metadata.quantity) : undefined,
                currency: paymentIntent.currency,
                status: paymentIntent.status,
                price: StripeService.toStripePrice(price),
            }) 
        } catch (error) {
            throw new AppError(
                "Failed to create payment record in the database.",
                500,
                ErrorTypes.INTERNAL_ERR
            )
        }
    }

    static async updatePayment(
        paymentIntent: Stripe.PaymentIntent,
    ) {
        try {
            await Payments.update({
                status: paymentIntent.status,
                customer_id: 
                    typeof paymentIntent.customer === 'string' ? paymentIntent.customer : null,
                amount_received: paymentIntent.amount_received,
                payment_method_type: paymentIntent.payment_method_types[0],
                failure_message: paymentIntent.last_payment_error?.message,
                receipt_url: 'smartbill receipt_url' // to do: configure receipt issuer api
            }, {
                where: {
                    payment_id: paymentIntent.id
                }
            });

            const updatedPayment = await Payments.findOne({
                where: { payment_id: paymentIntent.id }
            });

            return updatedPayment?.get();
        } catch (error) {
            throw new AppError(
                "Failed to confirm payment in the database.",
                500,
                ErrorTypes.INTERNAL_ERR
            );
        }
    }

    static async getUserPayments(user_id: number) {
        const payments = await Payments.findAll({
            where: {
                user_id: user_id
            }
        })

        return payments.map((payment) => payment.toSafePayment());
    }

}
