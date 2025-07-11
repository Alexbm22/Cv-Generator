import { loadStripe } from '@stripe/stripe-js';
import { apiService } from './api';
import { StripeProduct } from '../interfaces/stripe';
import { ApiResponse } from '../interfaces/api_interface';

export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

export class StripeService {
    private static apiUrl = '/protected/stripe';
    
    public static async getPricing() {
        return await (apiService.get<ApiResponse<StripeProduct>>(
            this.apiUrl + '/prices'
        ))
    }

    public static async createPaymentIntent(priceId: string) {
        return await apiService.post<ApiResponse<string>>(
            this.apiUrl + '/create_payment_intent',
            { priceId }
        )
    }
}