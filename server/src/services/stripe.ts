import { stripe } from '../app';
import Stripe from 'stripe';
import { Payment_Interval, StripePrice, StripeProduct } from '../interfaces/stripe';
import { AppError } from '../middleware/error_middleware';
import { ErrorTypes } from '../interfaces/error';
import { ApiResponse } from '../interfaces/api';

export class StripeService {
    static async getStripeProducts(): Promise<ApiResponse<StripeProduct>> {
        const StripePrices = await stripe.prices.list({ expand: [`data.product`] });
        const products = this.mapStripeToProductModel(StripePrices.data)
        if(!products) {
            throw new AppError(
                'No products found from Stripe price list.',
                500,
                ErrorTypes.INTERNAL_ERR
            )
        }

        return {
            success: true,
            message: 'Products fetched successfully',
            data: products[0]
        };
    }

    static async createPaymentIntent(
        priceId: string, 
        userId: number,
        quantity?: number
    ): Promise<ApiResponse<string | null>> {
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

        return {
            success: true,
            message: 'Payment intent created successfully',
            data: paymentIntent.client_secret
        };
    }

    private static mapStripeToProductModel(stripePrices: Stripe.Price[]): StripeProduct[] {
        const productMap = new Map<string, StripeProduct>();

        for(const price of stripePrices) {
            const product = price.product as Stripe.Product;

            // setting the new product
            if(!productMap.has(product.id)) {
                productMap.set(product.id, {
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    active: product.active,
                    prices: [],
                    metadata: product.metadata
                })
            }

            const productEntry = productMap.get(product.id)!;
            const convertedPrice = this.toStripePrice(price);

            // adding the price to the product obj
            productEntry.prices.push(convertedPrice);
        }

        return Array.from(productMap.values());
    }

    public static toStripePrice(price: Stripe.Price): StripePrice {
        return {
            id: price.id,
            type: price.type,
            amount: price.unit_amount! / 100,
            currency: price.currency.toUpperCase(),
            interval: price.recurring?.interval ? Payment_Interval[price.recurring?.interval] : undefined,
            interval_count: price.recurring?.interval_count ?? 1
        };
    }
}