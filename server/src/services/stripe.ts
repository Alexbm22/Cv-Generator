import { stripe } from '../app';
import Stripe from 'stripe';
import { StripePrice, StripeProduct } from '../interfaces/stripe';
import { AppError } from '../middleware/error_middleware';
import { ErrorTypes } from '../interfaces/error_interface';
import { ApiResponse } from '../interfaces/api_interface';

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
        userId: number
    ): Promise<ApiResponse<string | null>> {
        const price = await stripe.prices.retrieve(priceId)

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
                userId: userId
            }
        })

        return {
            success: true,
            message: 'Products fetched successfully',
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

            // adding the price to the product obj
            productEntry.prices.push({
                id: price.id,
                type: price.type,
                amount: price.unit_amount! / 100,
                currency: price.currency.toUpperCase(),
                interval: price.recurring?.interval ?? null,
                isDefault: product.default_price === price.id,
            })
        }

        return Array.from(productMap.values());
    }
}