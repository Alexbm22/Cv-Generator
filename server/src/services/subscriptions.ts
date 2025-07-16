import { Subscriptions } from "../models";
import { PublicSubscriptionData, SubscriptionStatus } from "../interfaces/subscriptions";
import { PaymentAttributes } from "../interfaces/payments";
import { getFutureDate } from "../utils/date_utils/getFutureDate";
import { AppError } from "../middleware/error_middleware";
import { ErrorTypes } from "../interfaces/error";

export class SubscriptionService {

    static async getUserSubscription(userId: number): Promise<PublicSubscriptionData | null> {
        const activeSubscription = await Subscriptions.findOne({
            where: {
                user_id: userId,
                status: SubscriptionStatus.ACTIVE
            }
        })
        return activeSubscription ? activeSubscription?.toSafeSubscription() : null;
    }

    static async createSubscription (paymentObj: PaymentAttributes) {
        try {
            const subscription_end_date = getFutureDate(paymentObj.price.interval!, paymentObj.price.interval_count ?? 1)
    
            const newSubscription = await Subscriptions.create({
                payment_id: paymentObj.payment_id,
                plan_id: paymentObj.price.id,
                user_id: paymentObj.user_id,
                status: SubscriptionStatus.ACTIVE,
                current_period_start: new Date(),
                current_period_end: subscription_end_date,
                billing_interval: paymentObj.price.interval!,
                billing_interval_count: paymentObj.price.interval_count ?? 1,
            })

            return newSubscription;
        } catch (error) {
            throw new AppError(
                "Failed to create subscription",
                500,
                ErrorTypes.INTERNAL_ERR
            )
        }

    }
}