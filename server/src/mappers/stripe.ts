import { Payment_Interval } from "@/interfaces/payments";
import { StripePrice, StripeProduct } from "@/interfaces/stripe";
import Stripe from "stripe";

const mapStripeToProductModel = (stripePrices: Stripe.Price[]): StripeProduct[] => {
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
            const convertedPrice = toStripePrice(price);

            // adding the price to the product obj
            productEntry.prices.push(convertedPrice);
        }

        return Array.from(productMap.values());
    }

const toStripePrice = (price: Stripe.Price): StripePrice => {
    return {
        id: price.id,
        type: price.type,
        amount: price.unit_amount! / 100,
        currency: price.currency.toUpperCase(),
        interval: price.recurring?.interval ? Payment_Interval[price.recurring?.interval] : undefined,
        interval_count: price.recurring?.interval_count ?? 1
    };
}

export default {
    toStripePrice,
    mapStripeToProductModel
}