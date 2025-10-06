import { SubscriptionCreationAttributs } from "@/interfaces/subscriptions";
import { Subscription } from "@/models";

const getSubscription = async (subscriptionCriteria: Partial<SubscriptionCreationAttributs>) => {
    return await Subscription.findOne({
        where: subscriptionCriteria
    })
}

const createSubscription = async (subscriptionData: SubscriptionCreationAttributs) => {
    return await Subscription.create(subscriptionData)
}

export default {
    getSubscription,
    createSubscription
}