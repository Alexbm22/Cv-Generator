import { loadStripe } from '@stripe/stripe-js';
import { apiService } from './api';
import { StripeProduct } from '../interfaces/stripe';

export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

export class StripeService {
    private static apiUrl = '/protected/stripe';
    
    public static async getPricing() {
        return await (apiService.get<StripeProduct[]>(
            this.apiUrl + '/prices'
        ))
    }

    public static async createPaymentIntent(priceLookupKey: string, quantity: number = 1) {
        return await apiService.post<string>(
            this.apiUrl + '/create_payment_intent',
            { priceLookupKey, quantity }
        )
    }

    public static async createSubscriptionCheckout(
        priceLookupKey: string
    ) {
        return await apiService.post<string>(
            this.apiUrl + '/create_subscription_checkout',
            { priceLookupKey }
        )
    }

    public static async confirmSetupAndSubscribe(
        setupIntentId: string,
        priceLookupKey: string
    ) {
        return await apiService.post<{ subscriptionId: string; status: string }>(
            this.apiUrl + '/confirm_setup_and_subscribe',
            { setupIntentId, priceLookupKey }
        )
    }

    public static async cancelSubscription() {
        return await apiService.post<{ status: string }>(
            this.apiUrl + '/cancel_subscription'
        )
    }

    public static async resumeSubscription() {
        return await apiService.post<{ status: string }>(
            this.apiUrl + '/resume_subscription'
        )
    }
}