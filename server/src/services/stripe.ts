import { stripe } from '../app';
import { StripeProduct } from '../interfaces/stripe';
import { AppError } from '../middleware/error_middleware';
import { ErrorTypes } from '../interfaces/error';
import { stripeMappers } from '@/mappers';

export class StripeService {
    static async getStripeProducts(): Promise<StripeProduct> {
        const StripePrices = await stripe.prices.list({ expand: [`data.product`] });
        const products = stripeMappers.mapStripeToProductModel(StripePrices.data)
        if(!products) {
            throw new AppError(
                'No products found from Stripe price list.',
                500,
                ErrorTypes.INTERNAL_ERR
            )
        }

        return products[0];
    }

    static async createPaymentIntent(
        priceId: string, 
        userId: number,
        quantity?: number
    ): Promise<string | null> {
        const price = await stripe.prices.retrieve(priceId);

        if(!price) {
            throw new AppError(
                'The selected price does not exist.',
                404,
                ErrorTypes.NOT_FOUND
            )
        }

        // Validate price type and quantity
        if(
            (price.type === 'one_time' && !quantity) ||
            (price.type === 'recurring' && quantity)
        ) {
            throw new AppError(
                'Invalid request: Quantity is required for one-time prices and should not be provided for recurring prices.',
                400,
                ErrorTypes.BAD_REQUEST
            )
        }

        if((!price.active) || price.deleted) {
            throw new AppError(
                'The selected price is either inactive or has been deleted.',
                400,
                ErrorTypes.BAD_REQUEST
            )
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: price.unit_amount!,
            currency: price.currency,
            payment_method_types: ['card'],
            metadata: {
                userId: userId,
                priceId: price.id,
                quantity: quantity || null
            }
        });

        return paymentIntent.client_secret;
    }
}