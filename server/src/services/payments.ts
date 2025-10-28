import { AppError } from "@/middleware/error_middleware";
import { Payment } from "@/models";
import Stripe from "stripe";
import { ErrorTypes } from "@/interfaces/error";
import { StripeService } from "@/services/stripe";
import { paymentRepository } from "@/repositories";
import { handleServiceError } from "@/utils/serviceErrorHandler";
import { stripeMappers } from "@/mappers";

export class PaymentService {

    @handleServiceError("Failed to create payment record in the database.")
    static async createPayment(
        paymentIntent: Stripe.PaymentIntent,
        price: Stripe.Price
    ) {
        await paymentRepository.createPayment({
            payment_id: paymentIntent.id,
            user_id: Number(paymentIntent.metadata.userId),
            customer_id: 
                typeof paymentIntent.customer === 'string' ? paymentIntent.customer : null,
            amount: paymentIntent.amount,
            quantity: paymentIntent.metadata.quantity ? Number(paymentIntent.metadata.quantity) : undefined,
            currency: paymentIntent.currency,
            status: paymentIntent.status,
            price: stripeMappers.toStripePrice(price),
        }) 
    }

    static async updatePayment(
        paymentIntent: Stripe.PaymentIntent,
    ) {
        try {
            const [affectedCount, affectedRows] = await paymentRepository.updatePaymentByFields({
                status: paymentIntent.status,
                customer_id: 
                    typeof paymentIntent.customer === 'string' ? paymentIntent.customer : null,
                amount_received: paymentIntent.amount_received,
                payment_method_type: paymentIntent.payment_method_types[0],
                failure_message: paymentIntent.last_payment_error?.message,
                receipt_url: 'smartbill receipt_url' // to do: configure receipt issuer api
            },{ 
                payment_id: paymentIntent.id 
            });

            if (affectedCount === 0) {
                throw new AppError(
                    "Payment not found or no changes made.",
                    404,
                    ErrorTypes.NOT_FOUND
                );
            }
        } catch (error) {
            console.error("Error updating payment:", error);
            throw new AppError(
                "Failed to confirm payment in the database.",
                500,
                ErrorTypes.INTERNAL_ERR
            );
        }
    }

    static async getUserPayments(user_id: number) {
        const payments = await paymentRepository.getPayments({ user_id: user_id })
        return payments.map((payment) => payment.toSafePayment());
    }

    static async getPayment(payment_id: string) {
        const payment = await paymentRepository.getPayment({ payment_id: payment_id })
        return payment
    }

    @handleServiceError("Failed to delete user payments")
    static async deleteUserPayments(user_id: number) {
        const deletedCount = await paymentRepository.deleteUserPayments(user_id);
        return deletedCount;
    }

}
